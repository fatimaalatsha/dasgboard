const DocumentList = ( Component ) => ({...props}) => {
    const { data, sub } = props
    
    return (
        <Component {...data} sub={sub} />
    )
}

export default DocumentList