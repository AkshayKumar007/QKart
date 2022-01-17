import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { config } from '../App';
import Footer from './Footer';
import Header from './Header';

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      username: '',
      password: '',
    };
  }

  performAPICall = async () => {
    let response = {};
    let errored = false;
    this.setState({
      loading: true,
    });

    response = await fetch(`${config.endpoint}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
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
    if (this.validateResponse(errored, response)) {
      return response;
    }
  };

  validateInput = () => {
    if (this.state.username === '') {
      message.error('Username is a required field');
      return false;
    }
    if (this.state.password === '') {
      message.error('Password is a required field');
      return false;
    }

    return true;
  };

  validateResponse = (errored, response) => {
    if (errored) {
      message.error('There was an error signing into your account');
      return false;
    }
    if (!response.success) {
      message.error(response.message);
      return false;
    }
    return true;
  };

  persistLogin = (token, username, balance) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('balance', balance);
  };

  login = async () => {
    if (this.validateInput()) {
      const response = await this.performAPICall();
      if (response) {
        this.persistLogin(response.token, response.username, response.balance);
        message.success('Logged in successfully');
        this.setState({
          username: '',
          password: '',
        });
        this.props.history.push('/products');
      }
    }
  };

  render() {
    return (
      <>
        <Header history={this.props.history} />

        <div className="flex-container">
          <div className="login-container container">
            <h1>Login to QKart</h1>

            <Input
              className="input-field"
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
              onChange={(e) => {
                this.setState({
                  username: e.target.value,
                });
              }}
            />

            <Input.Password
              className="input-field"
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              onChange={(e) => {
                this.setState({
                  password: e.target.value,
                });
              }}
            />

            <Button
              loading={this.state.loading}
              type="primary"
              onClick={this.login}
            >
              Login
            </Button>
          </div>
        </div>

        <Footer></Footer>
      </>
    );
  }
}

export default withRouter(Login);
