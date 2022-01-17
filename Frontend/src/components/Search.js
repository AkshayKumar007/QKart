import { Input, message } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { config } from '../App';
import Cart from './Cart';
import Header from './Header';
import Product from './Product';
import { Row, Col } from 'antd';
import Footer from './Footer';
import './Search.css';

class Search extends React.Component {
  constructor() {
    super();
    this.debounceTimeout = 300;
    this.products = [];
    this.state = {
      loading: false,
      loggedIn: false,
      filteredProducts: [],
    };
    this.CartRef = React.createRef();
  }

  validateResponse = (errored, response) => {
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

  performAPICall = async () => {
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

    if (this.validateResponse(errored, response)) {
      return response;
    }
  };

  getProducts = async () => {
    const response = await this.performAPICall();
    if (response) {
      this.products = response;
      const products = [...this.products];
      this.setState((prevState, props) => {
        return {
          filteredProducts: products,
        };
      });
    }
  };

  async componentDidMount() {
    await this.getProducts();
    if (localStorage.getItem('username') && localStorage.getItem('token')) {
      this.setState((prevState, props) => {
        return {
          loggedIn: true,
        };
      });
    }
  }

  search = (text) => {
    text = text.toLowerCase();
    let new_prods = this.products.filter((product) => {
      if (
        product.name.toLowerCase().includes(text) ||
        product.category.toLowerCase().includes(text)
      ) {
        return product;
      }
    });
    this.setState((prevState, props) => {
      return {
        filteredProducts: new_prods,
      };
    });
  };

  debounceSearch = (event) => {
    let target = event.target;
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(
      function () {
        this.search(target.value);
      }.bind(this),
      this.debounceTimeout
    );
  };

  getProductElement = (product) => {
    return (
      <Col xs={24} sm={12} xl={6} key={product._id}>
        <Product
          product={product}
          addToCart={() => {
            if (this.state.loggedIn) {
              this.CartRef.current.pushToCart(product._id, 1, true);
            } else {
              this.props.history.push('/login');
            }
          }}
        />
      </Col>
    );
  };

  render() {
    return (
      <>
        <Header history={this.props.history}>
          <Input.Search
            placeholder="Search"
            onChange={this.debounceSearch}
            onSearch={this.search}
            enterButton={true}
          />
        </Header>

        <Row>
          <Col
            md={{ span: this.state.loggedIn && this.products.length ? 18 : 24 }}
            xs={{ span: 24 }}
          >
            <div className="search-container ">
              <Row>
                {this.products.length !== 0 ? (
                  this.state.filteredProducts.map((product) =>
                    this.getProductElement(product)
                  )
                ) : this.state.loading ? (
                  <div className="loading-text">Loading products...</div>
                ) : (
                  <div className="loading-text">No products to list</div>
                )}
              </Row>
            </div>
          </Col>

          {this.state.loggedIn && this.products.length && (
            <Col md={{ span: 6 }} xs={{ span: 24 }} className="search-cart">
              <div>
                <Cart
                  history={this.props.history}
                  token={localStorage.getItem('token')}
                  products={this.products}
                  ref={this.CartRef}
                />
              </div>
            </Col>
          )}
        </Row>
        <Footer></Footer>
      </>
    );
  }
}

export default withRouter(Search);
