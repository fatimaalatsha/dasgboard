const DocumentList = ( Component ) => ({...props}) => {
    const { data } = props
    
    return (
        <Component {...data} />
    )
}

export default DocumentList