import {Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

export interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  score: number;
  account: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: text => text,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Score',
    key: 'score',
    dataIndex: 'score',
    render: (score) => (
      <Tag color='green'>
        {score} Score
      </Tag>
    ),
  },
  {
    title: 'Account',
    key: 'Account',
    dataIndex: 'account',
    render: (account) => (
      <span>{account}</span>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    score: 0,
    account: 'dddd'
  },
];

interface dataProps {
  data: any[],
}

const TableListPlayer: React.FC<dataProps> = (props) => {
  return (
    <>
      <h2 className='text-center'>
        List player
      </h2>
      <hr />

      <Table columns={columns} dataSource={props.data} />
    </>
  );
}

export default TableListPlayer;