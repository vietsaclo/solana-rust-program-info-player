import React from "react";
import { Button, Tag } from 'antd';
import TableListPlayer from "../components/TableListPlayer";

const HomePage: React.FC = () => {
  return (
    <div className="container mt-2 mb-5">
      <h2 className='text-center'>
        List player
      </h2>
      <hr />

      <TableListPlayer />

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
            <span className='h3'>0 Score</span>
          </Tag>
        </span>

        <div className='float-end'>
          <Button type='primary'>
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
    </div>
  );
}

export default HomePage;