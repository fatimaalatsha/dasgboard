const DocumentList = ( Component ) => ({...props}) => {
    const { data, sub, updateText, refetch } = props
    data.sub = sub
    data.updateText = updateText
    data.refetch = refetch

    /**
     * Set the status of the document
     */
    switch (data.status) {
        case 'approved':
            data.color = 'success'
            break
        case 'review':
            data.color = 'warning'
            break
        default:
            data.color = 'error'
            break
    }
    
    return (
        <Component {...data} />
    )
}

export default DocumentList