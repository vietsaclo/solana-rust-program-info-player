import { Button, Tag } from 'antd';
import React from 'react';
import { LoadingOutlined } from "@ant-design/icons";

interface MyGameInfoProps {
  score: number,
  fun_plusScoreNow: Function,
  isLoading: boolean,
}

const MyGameInfo: React.FC<MyGameInfoProps> = (props) => {
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
        <span className='fw-bold'>Ege: </span>
        <span>23</span>
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
          <Button type='primary'
            onClick={() => props.fun_plusScoreNow()}
          >
            +1 Score Now
          </Button>
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