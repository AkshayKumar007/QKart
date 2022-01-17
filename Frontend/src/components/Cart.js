import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Card, message, Spin, InputNumber } from 'antd';
import React from 'react';
import { config } from '../App';
import './Cart.css';

export default class Cart extends React.Component {
  constructor() {
    super();
    this.state = {
      items: [],
      loading: false,
    };
  }

  validateResponse = (errored, response) => {
    if (errored) {
      message.error(
        'Could not update cart. Check that the backend is running, reachable and returns valid JSON.'
      );
      return false;
    }

    if (response.message) {
      message.error(response.message);
      return false;
    }

    return true;
  };

  getCart = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(`${config.endpoint}/cart`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.props.token}`,
            'Content-Type': 'application/json',
          },
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response)) {
      return response;
    }
  };

  pushToCart = async (productId, qty, fromAddToCartButton) => {
    if (fromAddToCartButton) {
      for (const item of this.state.items) {
        if (item.productId === productId) {
          message.error(
            'Item already added to cart. Use the cart sidebar to update quantity or remove item.'
          );
          return;
        }
      }
    }

    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(`${config.endpoint}/cart`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.props.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: productId,
            qty: qty,
          }),
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response)) {
      await this.refreshCart();
      return response;
    }
  };

  refreshCart = async () => {
    const cart = await this.getCart();

    if (cart) {
      this.setState({
        items: cart.map((item) => ({
          ...item,
          product: this.props.products.find(
            (product) => product._id === item.productId
          ),
        })),
      });
    } else if (this.props.checkout && !cart) {
      message.error('Cart is empty! Add some items before checkout');
      this.props.history.push('/products');
    }
  };

  calculateTotal = () => {
    return this.state.items.length
      ? this.state.items.reduce(
          (total, item) => total + item.product.cost * item.qty,
          0
        )
      : 0;
  };

  async componentDidMount() {
    await this.refreshCart();
  }

  getQuantityElement = (item) => {
    if (this.props.checkout) {
      return <div className="cart-item-qty-fixed">Qty: {item.qty}</div>;
    } else {
      return (
        <InputNumber
          min={1}
          max={10}
          defaultValue={item.qty}
          onChange={async (value) => {
            await this.pushToCart(item.productId, value, false);
          }}
        />
      );
    }
  };

  render() {
    return (
      <div
        className={['cart', this.props.checkout ? 'checkout' : ''].join(' ')}
      >
        {this.state.items.length ? (
          <>
            {this.state.items.map((item) => (
              <Card className="cart-item" key={item.productId}>
                {/* Display product image */}
                <img
                  className="cart-item-image"
                  alt={item.product.name}
                  src={item.product.image}
                />

                <div className="cart-parent">
                  <div className="cart-item-info">
                    <div>
                      <div className="cart-item-name">{item.product.name}</div>

                      <div className="cart-item-category">
                        {item.product.category}
                      </div>
                    </div>

                    <div className="cart-item-cost">
                      ₹{item.product.cost * item.qty}
                    </div>
                  </div>

                  <div className="cart-item-qty">
                    {this.getQuantityElement(item)}
                  </div>
                </div>
              </Card>
            ))}

            <div className="total">
              <h2>Total</h2>

              <div className="total-item">
                <div>Products</div>
                <div>
                  {this.state.items.reduce(function (sum, item) {
                    return sum + item.qty;
                  }, 0)}
                </div>
              </div>

              <div className="total-item">
                <div>Sub Total</div>
                <div>₹{this.calculateTotal()}</div>
              </div>

              <div className="total-item">
                <div>Shipping</div>
                <div>N/A</div>
              </div>
              <hr></hr>

              <div className="total-item">
                <div>Total</div>
                <div>₹{this.calculateTotal()}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="loading-text">
            Add an item to cart and it will show up here
            <br />
            <br />
          </div>
        )}

        {!this.props.checkout && (
          <Button
            type="primary"
            style={{ background: '#ECA52E', borderColor: '#ECA52E' }}
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              if (!this.state.items.length) {
                message.error('You must add items to cart first');
              } else {
                this.props.history.push('/checkout');
              }
            }}
          >
            <strong> Checkout</strong>
          </Button>
        )}
        {this.state.loading && (
          <div className="loading-overlay">
            <Spin size="large" />
          </div>
        )}
      </div>
    );
  }
}
