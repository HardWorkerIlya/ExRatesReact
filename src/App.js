import React, { Component } from 'react';
import { DatePicker, Button, Row, Col, Table, message } from 'antd';
import axios from 'axios';
import moment from 'moment';
import * as parser from 'fast-xml-parser';
import locale from 'antd/lib/date-picker/locale/ru_RU';
import './App.scss';
import 'antd/dist/antd.css';

// sorter: (a, b) => a.CharCode !== b.CharCode ? a.CharCode < b.CharCode ? -1 : 1 : 0

const proxyurl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = 'http://www.cbr.ru/scripts/XML_daily.asp';

const columns = [{
  title: 'Код',
  dataIndex: 'CharCode',
  className: 'CharCode',
  width: 50
}, {
  title: 'Валюта',
  dataIndex: 'Name',
  className: 'Name'
}, {
  title: 'Курс ЦБ',
  dataIndex: 'Value',
  className: 'Value',
  sorter: (a, b) => parseFloat(a.Value) - parseFloat(b.Value)
}];

class App extends Component {
  state = {
    date: moment(),
    rates: [],
    isLoading: false,
    tableHeight: null
  }

  componentDidMount () {
    this.resizeTable()
    this.getRates()
    window.addEventListener("resize", this.resizeTable);
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.resizeTable);
  }

  getRates = () => {
    this.setState({ isLoading: true });
    axios.get(proxyurl + apiUrl, {
      params: {
        date_req: this.state.date.format("DD/MM/YYYY")
      },
      withCredentials: false
    })
      .then(res => {
        let rates = parser.parse(res.data).ValCurs.Valute

        rates.forEach((item, i) => { item.key = i})
        this.setState({ rates });
        this.setState({ isLoading: false });
      })
      .catch(() => {
        this.setState({ isLoading: false });
        message.warning('Упс! Что-то пошло не так...');
      })
  }

  handleChange = (value, mode) => {
    if (value) this.setState({ date: moment(value) });
    else this.setState({ date: moment() });
  }

  disabledDate (current) {
    return current && current > moment().endOf('day');
  }

  resizeTable = () => {
    this.setState({ tableHeight: document.documentElement.clientHeight - 139 });
  }

  render() {
    return (
      <div className="App">
        <Row align="middle" type="flex" justify="center">
          <Col xs={24} sm={24} md={14} lg={12} xl={10}>
            <Row>
              <Col span={12}>
                <DatePicker
                  value={this.state.date}
                  format={'DD-MM-YYYY'}
                  locale={locale}
                  disabledDate={this.disabledDate}
                  onChange={this.handleChange}/>
              </Col>
              <Col span={12}>
                <Button
                  ghost
                  loading={this.state.isLoading}
                  type="primary"
                  onClick={this.getRates}>Обновить</Button>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Table
                  pagination={false}
                  size={'middle'}
                  loading={this.state.isLoading}
                  columns={columns}
                  scroll={{y: this.state.tableHeight}}
                  dataSource={this.state.rates}/>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
