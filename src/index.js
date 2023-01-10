import React from 'react';
import ReactDOM from 'react-dom';
import { Amplify } from 'aws-amplify';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import awsExports from './aws-exports';
import App from './App';
import '@ant-design/cssinjs';
import { ConfigProvider, theme } from 'antd';

Amplify.configure(awsExports);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={theme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);