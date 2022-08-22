import { Button, Space, Tag } from 'antd';
import React from 'react';
import { LoadingOutlined } from "@ant-design/icons";

interface MyGameInfoProps {
  score: number,
  age: number,
  fun_plusScoreNow: Function,
  fun_minusScoreNow: Function,
  fun_updateAge: Function,
  isLoading: boolean,
}

const MyGameInfo: React.FC<MyGameInfoProps> = (props) => {
  const [age, setAge] = React.useState<string>('0');
  const handleUpdateAge = () => {
    const newAge = Number(age);
    if (newAge !== props.age && newAge > 0 && newAge < 500 && props.fun_updateAge) {
      props.fun_updateAge(newAge);
    }
  }

  return (
    <>
      <h2 className='text-center'>
        My game info
      </h2>
      <hr />
      <div>
        <span className='fw-bold'>Name: </span>
        <span>Vietsaclo</span>
      </div>
      <div>
        <Space>
          <span className='fw-bold'>Ege: </span>
          {props.isLoading ? <LoadingOutlined /> : <span className='fw-bold text-success'>{props.age}</span>}
          <span>
            <input onChange={(e) => setAge(e.target.value)} value={age} style={{ width: '100px' }} type='number' />
          </span>
          <span>
            <Button onClick={() => handleUpdateAge()} type='primary'>
              Update Age
            </Button>
          </span>
        </Space>
      </div>
      <div>
        <span className='fw-bold'>Address: </span>
        <span>Binh Chanh, Vinh Loc A, HCM</span>
      </div>
      <div className='border mt-3 mb-3 p-3'>
        <span className='fw-bold text-success'>Total Score:&nbsp;&nbsp;</span>
        <span>
          <Tag color='green'>
            <span className='h3'>{props.isLoading ? <LoadingOutlined style={{
              // fontSize: 'small'
            }} /> : props.score} Score</span>
          </Tag>
        </span>

        <div className='float-end'>
          <Space>
            <Button type='primary'
              onClick={() => props.fun_plusScoreNow()}>
              +1 Score Now
            </Button>

            <Button type='primary'
              onClick={() => props.fun_minusScoreNow()}>
              +2 Score Now
            </Button>
          </Space>
        </div>
        <br />
      </div>

      <div className='text-center p-5'>
        <span>
          @Solana.Game.Info-Player
        </span>
      </div>
    </>
  );
}

export default MyGameInfo;