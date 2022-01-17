import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { config } from '../App';
import Footer from './Footer';
import Header from './Header';

class Register extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      username: '',
      password: '',
      confirmPassword: '',
    };
  }

  performAPICall = async () => {
    let response = {};
    let errored = false;
    this.setState({
      loading: true,
    });

    response = await fetch(`${config.endpoint}/auth/register`, {
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
        console.log(error);
        errored = true;
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
    if (this.state.username.length < 6 || this.state.username.length > 32) {
      message.error('Username should be 6 to 32 characters');
      return false;
    }
    if (this.state.password === '') {
      message.error('Password is a required field');
      return false;
    }
    if (this.state.password.length < 6 || this.state.password.length > 32) {
      message.error('Password should be 6 to 32 characters');
      return false;
    }
    if (this.state.password !== this.state.confirmPassword) {
      message.error('Passwords are not matching');
      return false;
    }
    return true;
  };

  validateResponse = (errored, response) => {
    if (errored) {
      message.error('There was an error creating account');
      return false;
    }
    if (!response.success) {
      message.error(response.message);
      return false;
    }
    if (response.success) return true;
  };

  register = async () => {
    if (this.validateInput()) {
      const response = await this.performAPICall();
      if (response) {
        // debugger;
        message.success('Registered successfully');
        this.setState({
          username: '',
          password: '',
          confirmPassword: '',
        });
        this.props.history.push('/login');
      }
    }
  };

  render() {
    return (
      <>
        <Header history={this.props.history} />
        <div className="flex-container">
          <div className="register-container container">
            <h1>Make an account</h1>

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
            <Input.Password
              className="input-field"
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Confirm Password"
              onChange={(e) => {
                this.setState({
                  confirmPassword: e.target.value,
                });
              }}
            />

            <Button
              loading={this.state.loading}
              type="primary"
              onClick={this.register}
            >
              Register
            </Button>
          </div>
        </div>

        <Footer></Footer>
      </>
    );
  }
}

export default withRouter(Register);
