import * as React from 'react';
import INFTPaginationProps from '../interfaces/INFTPaginationProps';

import styles from "../styles/Pagination.module.css";

export function NftPagination (props: INFTPaginationProps) {
  const { active: activePage, total, pageSize, show, totalFetched } = props; 
   
  const handleNextPageChange = () => {
    show(); 
  }

  return (
    <div className={`${styles.pagination}`}>
        <p>Showing {totalFetched} out of {total} </p>
        { totalFetched !== total && <button onClick={handleNextPageChange}>Show More..</button>}
    </div>
  );
}


export default NftPagination;