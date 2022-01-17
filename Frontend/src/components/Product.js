import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Card, Rate } from 'antd';
import React from 'react';
import './Product.css';

export default function Product(props) {
  return (
    <Card className="product" hoverable>
      <img className="product-image" alt="product" src={props.product.image} />
      <div className="product-info">
        <div className="product-info-text">
          <div className="product-title">{props.product.name}</div>
          <div className="product-category">{`Category: ${props.product.category}`}</div>
        </div>

        <div className="product-info-utility">
          <div className="product-cost">{`₹${props.product.cost}`}</div>
          <div>
            <Rate allowHalf disabled defaultValue={props.product.rating} />
          </div>

          <Button
            shape="round"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={props.addToCart}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
