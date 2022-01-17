import { Button, message, Radio, Row, Col } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { config } from '../App';
import Cart from './Cart';
import './Checkout.css';
import Footer from './Footer';
import Header from './Header';
import { fdatasync } from 'fs';

class Checkout extends React.Component {
  constructor() {
    super();
    this.cartRef = React.createRef();
    this.state = {
      products: [],
      addresses: [],
      selectedAddressIndex: 0,
      newAddress: '',
      balance: 0,
      loading: false,
    };
  }

  validateGetProductsResponse = (errored, response) => {
    if (errored || (!response.length && !response.message)) {
      message.error(
        'Could not fetch products. Check that the backend is running, reachable and returns valid JSON.'
      );
      return false;
    }

    if (!response.length) {
      message.error(response.message || 'No products found in database');
      return false;
    }

    return true;
  };

  getProducts = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (await fetch(`${config.endpoint}/products`)).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateGetProductsResponse(errored, response)) {
      if (response) {
        this.setState({
          products: response,
        });
      }
    }
  };

  validateResponse = (errored, response, couldNot) => {
    if (errored) {
      message.error(
        `Could not ${couldNot}. Check that the backend is running, reachable and returns valid JSON.`
      );
      return false;
    }
    if (response.message) {
      message.error(response.message);
      return false;
    }
    return true;
  };

  getAddresses = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(`${config.endpoint}/user/addresses`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response, 'fetch addresses')) {
      if (response) {
        this.setState({
          addresses: response,
        });
      }
    }
  };

  addAddress = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(`${config.endpoint}/user/addresses`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: this.state.newAddress,
          }),
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response, 'add a new address')) {
      if (response) {
        message.success('Address added');

        this.setState({
          newAddress: '',
        });

        await this.getAddresses();
      }
    }
  };

  deleteAddress = async (addressId) => {
    console.log(typeof addressId);
    let response = {};
    let errored = false;
    this.setState({
      loading: true,
    });
    response = await fetch(`${config.endpoint}/user/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })
      .then((data) => {
        return data.json();
      })
      .catch((error) => {
        errored = true;
        console.log(error);
      });
    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response, 'delete the address')) {
      if (response) {
        message.success('Address deleted');
        await this.getAddresses();
      }
    }
  };

  checkout = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(`${config.endpoint}/cart/checkout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addressId:
              this.state.addresses[this.state.selectedAddressIndex]._id,
          }),
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response, 'checkout')) {
      message.success('Order placed');
      let newBalance = localStorage.setItem(
        'balance',
        this.state.balance - this.cartRef.current.calculateTotal()
      );
      this.setState((prevState, props) => {
        return {
          balance: newBalance,
        };
      });
      this.props.history.push('/thanks');
    }
  };

  order = async () => {
    if (this.state.balance < this.cartRef.current.calculateTotal()) {
      message.error('Insufficient Balance.');
    } else if (
      this.state.newAddress === '' &&
      this.state.addresses.length === 0
    ) {
      message.error('No Address selected');
    } else {
      this.checkout();
    }
  };

  async componentDidMount() {
    if (localStorage.getItem('username') && localStorage.getItem('token')) {
      await this.getProducts();
      await this.getAddresses();
      this.setState((prevState, props) => {
        return {
          balance: localStorage.getItem('balance'),
        };
      });
    } else {
      message.error('User must be logged in');
      this.props.history.push('/login');
    }
  }

  render() {
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    return (
      <>
        <Header history={this.props.history} />

        <div className="checkout-container">
          <Row>
            <Col
              xs={{ span: 24, order: 2 }}
              md={{ span: 24, order: 2 }}
              lg={{ span: 18, order: 1 }}
            >
              <div className="checkout-shipping">
                <h1 style={{ marginBottom: '-10px' }}>Shipping</h1>

                <hr></hr>
                <br></br>

                <p>
                  Manage all the shipping addresses you want (work place, home
                  address)<br></br>This way you won't have to enter the shipping
                  address manually with each order.
                </p>

                <div className="address-section">
                  {this.state.addresses.length ? (
                    <Radio.Group
                      className="addresses"
                      defaultValue={this.state.selectedAddressIndex}
                      onChange={(e) => {
                        this.setState({
                          selectedAddressIndex: e.target.value,
                        });
                      }}
                    >
                      <Row>
                        {this.state.addresses.map((address, index) => (
                          <Col xs={24} lg={12} key={address._id}>
                            <div className="address">
                              <Radio.Button value={index}>
                                <div className="address-box">
                                  {/* Display address title */}
                                  <div className="address-text">
                                    {address.address}
                                  </div>

                                  <Button
                                    type="primary"
                                    onClick={() => {
                                      this.deleteAddress(address._id);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </Radio.Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Radio.Group>
                  ) : (
                    <div className="red-text checkout-row">
                      No addresses found. Please add one to proceed.
                    </div>
                  )}

                  <div className="checkout-row">
                    <div>
                      <TextArea
                        className="new-address"
                        placeholder="Add new address"
                        rows={4}
                        value={this.state.newAddress}
                        onChange={(e) => {
                          this.setState({
                            newAddress: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <div>
                      <Button type="primary" onClick={this.addAddress}>
                        Add New Address
                      </Button>
                    </div>
                  </div>
                </div>

                <br></br>

                <div>
                  <h1 style={{ marginBottom: '-10px' }}>Pricing</h1>

                  <hr></hr>

                  <h2>Payment Method</h2>

                  <Radio.Group value={1}>
                    <Radio style={radioStyle} value={1}>
                      Wallet
                      <strong> (₹{this.state.balance} available)</strong>
                    </Radio>
                  </Radio.Group>
                </div>

                <br></br>

                <Button
                  className="ant-btn-success"
                  loading={this.state.loading}
                  type="primary"
                  onClick={this.order}
                >
                  <strong>Place Order</strong>
                </Button>
              </div>
            </Col>

            <Col
              xs={{ span: 24, order: 1 }}
              md={{ span: 24, order: 1 }}
              lg={{ span: 6, order: 2 }}
              className="checkout-cart"
            >
              <div>
                {this.state.products.length && (
                  <Cart
                    ref={this.cartRef}
                    products={this.state.products}
                    history={this.props.history}
                    token={localStorage.getItem('token')}
                    checkout={true}
                  />
                )}
              </div>
            </Col>
          </Row>
        </div>

        <Footer></Footer>
      </>
    );
  }
}

export default withRouter(Checkout);
