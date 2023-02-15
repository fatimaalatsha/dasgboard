import { useState, useEffect} from 'react'
import { Spin, Modal, Alert, Result, message } from 'antd'

import useFetch from "../../hooks/use-fetch"
import { PdfRenderer }  from "../DocViewer"
import { createPinkSlip } from '../../utils/pdf-document'
import {uint8ArrayToS3} from '../../utils/s3-storage'

import { pinkSlipContent } from '../../assets/data/pinkslipcontent' // Pink skil object content

const PinkSlipModal = ({ id, usersub , open, setOpen}) => {
  const { data, error, isLoading } = useFetch(`/v1/drivers/cc/${id}/vehicles`)
  //console.log(data)
    const [pinkslip, setPinkslip] = useState({
        pdfBytes: null, 
        pdfUrl: null
    })
   const [showAlert, setShowAlert] = useState(false);

    isLoading && !pinkslip.pdfUrl && < Spin />

    error && <p>{error}</p>
    
  const findActiveVehicle = (arr) => {
     setTimeout(() => {
     setShowAlert(true);
       }, 300);
      const activeObj = arr.find((obj) => obj.status === "active")
      if (!activeObj) return false
      const keys = Object.keys(activeObj)
      const hasValue = keys.every((key) => activeObj[key])
      if (hasValue) return activeObj
      return false
  }
    

    
    const createPdf = async () => {
      const activeVehicle = data.items && findActiveVehicle(data.items)
      if (activeVehicle) {
        for (const key in pinkSlipContent) {
          if (activeVehicle.hasOwnProperty(key)) {
            pinkSlipContent[key].value = ['model', 'make'].includes(key) ? activeVehicle[key].name : activeVehicle[key].toString()
          }
        }
        await createPinkSlip(pinkSlipContent)
        .then((pdfBytes) => {
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            setPinkslip({pdfBytes, pdfUrl: url})
        })
      }
    }

    const uploadPinkSlip = async () => {
      await uint8ArrayToS3(usersub, pinkslip.pdfBytes)
        .then((res) => {
          open && setOpen(false)
          message.success('Pink Slip Uploaded successfully!')        
          })
    }


  useEffect(() => {
    data && createPdf()
  }, [data])


  if (pinkslip.pdfUrl && findActiveVehicle(data.items)) {
    return (
      <Modal
        title="Pink Slip"
        open={open}
        onCancel={() => setOpen(false)}
        okText="Upload"
        onOk={() => uploadPinkSlip()}
        okButtonProps={{ disabled: !pinkslip.pdfUrl }}
        destroyOnClose
      >
      <PdfRenderer url={pinkslip.pdfUrl} /> 
      </Modal>
    )
  }    
  else {
    return (
      <Modal
        title="Pink Slip"
        open={open}
        onCancel={() => setOpen(false)}
        okText="Upload"
        onOk={() => uploadPinkSlip()}
        okButtonProps={{ disabled: true }}
        destroyOnClose
      >
        {showAlert && <Alert
          message="Pink Slip Creation Failed"
          description="Driver does not have all the vehicle information required."
          type="error"
          showIcon
        />}
      </Modal>
    )
  }
}

export default PinkSlipModal