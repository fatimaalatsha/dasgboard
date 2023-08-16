import { useState, useEffect} from 'react'
import { Spin, Modal, Alert, Result, message } from 'antd'

import useFetch from "../../hooks/use-fetch"
import { PdfRenderer }  from "../DocViewer"
import { createPinkSlip } from '../../utils/pdf-document'
import {uint8ArrayToS3} from '../../utils/s3-storage'
import { pinkSlipContent } from '../../assets/data/pinkslipcontent' // Pink skil object content
import { updatePinkSlipStatus } from '../../utils/doc-status'

const PinkSlipModal = ({ id, provinceId, usersub, open, setOpen, pinkslipStatus }) => {
  const { data, error, isLoading } = useFetch(`/v1/drivers/cc/${id}/vehicles`)
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
        
  const createPdf = async (provinceId) => {
    // keys to skip according to province
     const skipKeys = (provinceId) => {
        if (provinceId === 1) {
            return [
                "policy_number_alberta",
                "effective_date_alberta",
                "expiry_date_alberta",
            ];
        } else if (provinceId === 6) {
            return [
                "policy_number_ontario",
                "effective_date_ontario",
                "expiry_date_ontario",
            ];
        } else {
            return []; // Return empty array if no condition matches
        }
    };

    const skippedKeys = skipKeys(provinceId);

    const activeVehicle = data.items && findActiveVehicle(data.items);
    if (activeVehicle) {
      for (const key in pinkSlipContent) {
        if (activeVehicle.hasOwnProperty(key) ) {
          pinkSlipContent[key].value = ["model", "make"].includes(key)
            ? activeVehicle[key].name
            : activeVehicle[key].toString();
        }
      }

      // Remove skipped keys from pinkSlipContent
      const updatedPinkList = Object.keys(pinkSlipContent).reduce((result, key) => {
        if (!skippedKeys.includes(key)) {
          result[key] = pinkSlipContent[key];
        }
        return result;
      }, {});

      await createPinkSlip(updatedPinkList).then((pdfBytes) => {
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPinkslip({ pdfBytes, pdfUrl: url });
      });
    }
  };

    const uploadPinkSlip = async () => {
      await uint8ArrayToS3(usersub, pinkslip.pdfBytes)
        .then((res) => {
          updatePinkSlipStatus(id , pinkslipStatus)
          .then(() => {
            open && setOpen(false)
          message.success('Pink Slip Uploaded successfully!')
          })
        })
    }


  useEffect(() => {
    data && createPdf(provinceId);
  }, [data])


  if (pinkslip.pdfUrl && findActiveVehicle(data.items)) {
    return (
      <Modal
        title="Pink Slip"
        open={open}
        onCancel={() => setOpen(false)}
        okText="Upload"
        onOk={() => uploadPinkSlip()  }
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