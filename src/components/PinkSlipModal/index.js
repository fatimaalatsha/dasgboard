import { useState, useEffect} from 'react'
import { Spin, Modal, Alert, Result, message } from 'antd'

import useFetch from "../../hooks/use-fetch"
import DocViewer, { PdfRenderer }  from "../DocViewer"
import { createPinkSlip } from '../../utils/pdf-document'
import {uint8ArrayToS3} from '../../utils/s3-storage'

import { pinkSlipContent } from '../../assets/data/pinkslipcontent' // Pink skil object content
import { withSuccess } from 'antd/es/modal/confirm'

const PinkSlipModal = ({ id, usersub , open, setOpen}) => {
  const { data, error, isLoading } = useFetch(`/v1/drivers/cc/${id}/vehicles`)
  //console.log(data)
    const [pinkslip, setPinkslip] = useState({
        pdfBytes: null, 
        pdfUrl: null
    })

    isLoading && !pinkslip.pdfUrl && < Spin />

    error && <p>{error}</p>
    
  const findActiveVehicle = (arr) => {
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
        {(pinkslip.pdfUrl && findActiveVehicle(data.items)) && <PdfRenderer url={pinkslip.pdfUrl} /> }
         
        {!pinkslip.pdfUrl && <Alert
          message="Pink Slip Creation Failed"
          description="Driver does not have all the vehicle information required."
          type="error"
          showIcon
          />}
      </Modal>
    )
        
}

export default PinkSlipModal