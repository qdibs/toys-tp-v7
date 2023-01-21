export default interface INFTPaginationProps {
    total: Number
    pageSize: Number  
    active: Number 
    show?: any 
    totalFetched: Number
    nextCursor: String | null
}
