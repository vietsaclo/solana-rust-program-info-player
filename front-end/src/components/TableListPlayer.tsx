import { Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  score: number;
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
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        Invite {record.name}
        Delete
      </Space>
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
  },
];

const TableListPlayer: React.FC = () => {
  return (
    <>
      <h2 className='text-center'>
        List player
      </h2>
      <hr />

      <Table columns={columns} dataSource={data} />
    </>
  );
}

export default TableListPlayer;