import { useState, useEffect} from 'react'
import { Spin, Modal, Alert } from 'antd'

import useFetch from "../../hooks/use-fetch"
import DocViewer, { PdfRenderer }  from "../DocViewer"
import { createPinkSlip } from '../../utils/pdf-document'
import {uint8ArrayToS3} from '../../utils/s3-storage'


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

/* function objToString(obj) {
  let result = '';

  for (const key in obj) {
    result += `${obj[key].leble}: ${obj[key].value}\n`;
  }

  return result;
} */


    
  const pinkSlipContent = [
    {
      label: "Name of Insured/Nom de l'Assuré:",
      value: "Motor Vehicle Liability Insurance Card/Certificat d'Assurance Automobile Responsabilité"
    },
    {
      label: "Name of Insured/Nom de l'Assuré:",
      value: "10311669 Canada Corp Inc. o/a Uride, any Rideshare Driver while in the pre-acceptance period or post-acceptance period, any Rideshare Vehicle Owner"
    },
    {
      label: "Name and Addresses of Insurance Company/Nom et Adresse de la Compagnie d'Assurance:",
      value: "Northbridge General Insurance Corporation"
    },
    {
      label: "Agent or Broker/Agent ou Coutier:",
      value: "GILLONS' INSURANCE BROKERS LTD."
    },
    {
      label: "Policy Number/Police Numéro:",
      value: "CBC 0669282"
    },
    {
      label: "Effective Date/Date d'Entrée en Vigueur:",
      value: "October 7, 2022 / 7 octobre 2022"
    },
    {
      label: "Date of Expiry/Date d'Expiration:",
      value: "April 6, 2023 / 6 avril 2023"
    },
    {
      label: "Licence Plate Number/Numéro de Plaque:",
      value: ""
    },
    {
      label: "Insured Vehicle/Véhicule Assuré:",
      value: ""
    },
    {
      label: "Make/Marque",
      value: ""
    },
    {
      label: "Year/Année:",
      value: ""
    },
    {
      label: "Model/Modèle:",
      value: ""
    }
]
  
    //console.log(objToString(PinkslipText));

    /* const PinkslipContent = 
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
  Licence Plate Number/Numéro de Plaque:
   
  Insured Vehicle/Véhicule Assuré:
  Make/Marque: ${data.items && findActiveVehicle(data.items).make.name}
  Year/Année: ${data.items && findActiveVehicle(data.items).make.name}
  Model/Modèle: ${data.items && findActiveVehicle(data.items).make.name}                                         
  ` */
    
    const createPdf = async () => {
      const activeVehicle = data.items && findActiveVehicle(data.items)
      console.log(activeVehicle)
      activeVehicle && pinkSlipContent.map((obj) => {
        obj.label === "Make/Marque" && (obj.value = activeVehicle.make.name)
        obj.label === "Year/Année" && (obj.value = activeVehicle.year)
        obj.label === "Model/Modèle" && (obj.value = activeVehicle.model.name)
        obj.label === "Licence Plate Number/Numéro de Plaque:" && (obj.value = activeVehicle.plate_number)
       
      })
      console.log(pinkSlipContent)
      /* await createPinkSlip(objToString(PinkslipText))
        .then((pdfBytes) => {
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            setPinkslip({pdfBytes, pdfUrl: url})
            //console.log(pdfBytes, url)
        }) */
    }

    const uploadPinkSlip = async () => {
        await uint8ArrayToS3(usersub, pinkslip.pdfBytes)
            .then((res) => {
                console.log(res)
            })
    }


  useEffect(() => {
    data && createPdf()
  }, [data])

  //console.log(data)
  //console.log(data.items)

  //data.items && console.log(findActiveVehicle(data.items).make.name)

  //if(pinkslip.pdfUrl && data.items && findActiveVehicle(data.items) )  {
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
             { true ? (
              <PdfRenderer url={pinkslip.pdfUrl} /> 
              ) : (
                <>These are not the droids you are looking for.</>
              )}
            
      </Modal>
        )
    //}
    /* else{
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
              description="Please make sure you have an active vehicle and try again."
                    type="error"
                    showIcon
               />
          </Modal>
            )
        } */
}

export default PinkSlipModal