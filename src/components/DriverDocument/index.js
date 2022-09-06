import { Button, Collapse, Image, Row, Modal, Input, Form  } from 'antd';
import { useState } from 'react';
import API from '../../api/BaseUrl';
import AWS from 'aws-sdk';

import useFectch from '../../hooks/use-fetch'// Import useFetch custom hook
import Document from '../Document' // Import Document component

const { Panel } = Collapse;

AWS.config.update({
  region: 'us-east-2',
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
});

const DriverDocument = ({ id }) => {
  const { data, isLoading, error } = useFectch(`/v1/documents/cc/drivers/${id}`)// Call useFetch custom hook

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error...</div>
  }

  return (
    <>
    {
      data.items.map((item, index) => (
        <Document key={index} data={item} />
      ))
    }
    </>
  )

  /* const s3 = new AWS.S3();
  const [form] = Form.useForm();
  const [documentURL, setDocumentURL] = useState();
  const [secondDocumentURL, setSecondDocumentURL] = useState();
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [documentStatus, setDocumentStatus] = useState(document.status);
  const [publicNotes, setPublicNotes] = useState(document.notes_public || '')
  const [isModalVisible, setIsModalVisible] = useState(false); */

  /* const showModal = () => {
    setIsModalVisible(true);
  }; */

  /* const handleCancel = () => {
    setIsModalVisible(false);
    setPublicNotes(document.notes_public);
    form.setFieldsValue({ reason: document.notes_public });
  }; */

  /* const onPanelChange = () => {
    if(!documentLoaded) {
      getS3Document(document.key1, document.key2)
    }
    setDocumentLoaded(!documentLoaded)
  }; */

  /**
    * Updates the status of the current document loaded in this component.
    * @param status - The updated status of the document. This can be one of the following: 'approved' or 'rejected'
    * @param type - Type of the document. Can be be one of the follwing: 'user' or 'vehicle'
    * @param notes - The notes that will be added to the document.
    * @param notesPublic - The notes that will be added to the document to show to the user.
  */
 /*  const changeDocStatus = async(status, type) => {
    if (status === 'rejected') {
      setIsModalVisible(false);
    }
    const options = {
      headers: {
          'Authorization': 'accessToken'
      }
    }
    const body = {
      status,
      type,
      notes_public: publicNotes,
    }
    await API.post(`/v1/documents/cc/${document.id}`, body, options).then(response => {
      setDocumentStatus(`${status}`)
      document.notes_public = publicNotes
      console.log(response)
    })
  }; */

  /**
    * Retrieves a signed URL to retrieve the S3 Document for the key provided.
    * @param key - The object key assigned to the S3 document being retrieved for display.
  */
 /*  const getS3Document = (key) => {
    var params = {Bucket: 'uridriverportal6363c4dfcd0c439fad3c8ba89fc0c5b6184329-staging', 
    Key: `private/${userPrefix}/${key}`,
    Expires: 5};
    var promise = s3.getSignedUrlPromise('getObject', params);
    promise.then(function(url) {
      setDocumentURL(url)
      console.log(url)
    }, function(err) { console.log(err) });
  }; */

  /**
    * Takes the document name and status cleans them up.
  */
  /* const renderHeader = () => {
    const documentName = ({
      'ownership': 'Vehicle Registration',
      'safety': 'Safety Inspection',
      'work_permit':'Proof of Work Eligibility',
      'insurance':'Insurance Information',
      'driver_license':'Driver License',
      'abstract': 'Driver Abstract',
      'licensing':'City Licensing',
      'background':'Background Check',
    })[document.document.name] ?? document.document.name

    const docStatus = ({
      'expired': 'Expired',
      'approved': 'Approved',
      'rejected':'Rejected',
      'review':'Document needs to be reviewed',
    })[documentStatus] ?? documentStatus
    
   return ( `${documentName} - ${docStatus}`)
  }; */

  /* return( 
    <Collapse bordered={true} onChange={onPanelChange}>
      <Panel style={{ textTransform: 'capitalize' }} header={renderHeader()} key={document.id}>
        <Row justify='center'>
          <Image src={documentURL} width={400} preview={true}/>
        </Row>
        <Row justify='center'>
          <div style={styles.buttonsContainer}>
            <Button block type="danger" size="large" style={styles.button} onClick={showModal}>
              Reject Document
            </Button>
            <Modal 
              title="Why are you rejecting this document?" 
              visible={isModalVisible} 
              onOk={(e) => changeDocStatus('rejected', document.document.type)} 
              onCancel={handleCancel}
            >
              <Form form={form} layout="vertical" name="modal_form" initialValues={{reason: `${publicNotes}`}}>
                <Form.Item name="reason">
                  <Input.TextArea onChange={(e) => {setPublicNotes(e.target.value)}} rows={3} placeholder="Reason for rejecting document" />
                </Form.Item>
              </Form>
            </Modal>
            <Button block type="primary" size="large" style={styles.button} onClick={() => changeDocStatus('approved', document.document.type)}>
                Approve Document
            </Button>
          </div>
        </Row>
      </Panel>
    </Collapse>
  ) */
}

/* const styles = {
  buttonsContainer: {
    display: 'flex',
    paddingBottom: 30,
    paddingTop: 30
  },
  button: {
    marginRight: 20,
    marginLeft: 20
  }
}; */

export default DriverDocument