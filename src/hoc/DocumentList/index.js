const DocumentList = ( Component ) => ({...props}) => {
    const { data, sub } = props
    data.sub = sub
    
    return (
        <Component {...data} />
    )
}

export default DocumentList