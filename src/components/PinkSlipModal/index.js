import { useState, useEffect} from 'react'
import { Spin, Modal, Alert } from 'antd'

import useFetch from "../../hooks/use-fetch"
import DocViewer, { PdfRenderer }  from "../DocViewer"
import { createPinkSlip } from '../../utils/pdf-document'
import {uint8ArrayToS3} from '../../utils/s3-storage'


const PinkSlipModal = ({ id, usersub , open, setOpen}) => {
    const { data, error, isLoading } = useFetch(`/v1/drivers/cc/${id}/vehicles`)
    const [pinkslip, setPinkslip] = useState({
        pdfBytes: null, 
        pdfUrl: null
    })

    isLoading && < Spin />

    error && <p>{error}</p>

    const validateInfo = (data) => {
        const { make, model, year, vin, plate, sub_id } = data
        if (make && model && year && vin && plate && sub_id) {
            return true
        } else {
            return false
        }
    }
    
    const PinkslipContent = 
  `                       Motor Vehicle Liability Insurance Card/
                      Certificat d’Assurance Automobile Responsabilité


  Name of Insured/Nom de l’Assuré:         10311669 Canada Corp Inc. o/a Uride, any
                                        Rideshare Driver while in the
                                        pre-acceptance period or post-acceptance
                                        period, any Rideshare Vehicle Owner 
   
  Name and Addresses of Insurance       Northbridge General Insurance
  Company/Nom et Adresse de la          Corporation
  Company/Nom et Adresse de la          105 Adelaide St., West, Suite 700,
  Compagnie d’Assurance:                     Toronto, ON M5H 1P9                         
                                   
  Agent or Broker/Agent ou Coutier:     GILLONS’ INSURANCE BROKERS LTD.

  Policy Number/Police Numéro:           CBC 0669282
  Effective Date/Date d’Entrée en Vigueur: October 7, 2022 / 7 octobre 2022
  Date of Expiry/Date d’Expiration: April 6, 2023 / 6 avril 2023                                              
  `
    
    const createPdf = async () => {
        await createPinkSlip(PinkslipContent)
            .then((pdfBytes) => {
                const blob = new Blob([pdfBytes], { type: 'application/pdf' })
                const url = URL.createObjectURL(blob)
                setPinkslip({pdfBytes, pdfUrl: url})
                console.log(pdfBytes, url)
            })
    }

    const uploadPinkSlip = async () => {
        await uint8ArrayToS3(usersub, pinkslip.pdfBytes)
            .then((res) => {
                console.log(res)
            })
    }


    useEffect(() => {createPdf()}, [data])
   
    console.log(data)
     
  if(pinkslip.pdfUrl && validateInfo === true)  {
    return (
      <Modal
        title="Pink Slip"
        open={open}
        onCancel={() => setOpen(false)}
        okText="Upload"
        onOk={() => uploadPinkSlip()}
        destroyOnClose
      >
            {/* <DocViewer objectKey={`${data.sub_id}/Pinkslip/document.pdf`}/> */}
             <PdfRenderer url={pinkslip.pdfUrl} /> 
            <Alert
                message="Upload error"
                description="Please make sure all the information in the vehicle is filled out."
                type="error"
                showIcon
           />
      </Modal>
        )
    }
    else{
        return (
          <Modal
            title="Pink Slip"
            open={open}
                onCancel={() => setOpen(false)}
                onOk={() => setOpen(false)}
            destroyOnClose
          >
                <Alert
                    message="Upload error"
                    description="Please make sure all the information in the vehicle is filled out."
                    type="error"
                    showIcon
               />
          </Modal>
            )
        }
}

export default PinkSlipModal