import { PDFDocument, StandardFonts, rgb} from 'pdf-lib'


const createPinkSlip = async (text) => { // Create a function to create the pink slip
  const pdfDoc = await PDFDocument.create()
  const helveticaB = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const page = pdfDoc.addPage()
  const { width, height } = page.getSize()
  const title = ["Motor Vehicle Liability Insurance Card", "/Certificat d'Assurance Automobile Responsabilité"]
  const fontSize = 12
  let axis = {
    x: 40,
    y: height - 8 * fontSize,
  }
    //to add the pink color to the background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(1, 0.776, 0.960),
    })
  
    title.map((title, idx) => {
      page.drawText(title, {
        x: width / 2 - (title.length * 3),
        y: height - (2 * fontSize) - (idx * 23),
        size: fontSize,
        font: helveticaB,
        color: rgb(0, 0, 0),
      })
    })


  Object.keys(text).forEach((key) => {
     Array.isArray(text[key].label) ?
      text[key].label.map((label, idx) => {
        page.drawText(label, {
          x: 50,
          y: axis.y - (idx * 23),
          size: fontSize,
          font: helveticaB,
          color: rgb(0, 0, 0),
        })
        //axis = {...axis, y: axis.y - 23 }
      })
      :
      page.drawText(text[key].label, {
        x: 50,
        y: axis.y,
        size: fontSize,
        font: helveticaB,
        color: rgb(0, 0, 0),
      })
    Array.isArray(text[key].value) ?
      text[key].value.map((value) => {
        page.drawText(value, {
          x: 320,
          y: axis.y,
          size: fontSize,
          font: helveticaB,
          color: rgb(0, 0, 0),
        })
        axis = {...axis, y: axis.y - 25 }
      })
      :
      page.drawText(text[key].value, {
        x: 320,
        y: axis.y,
        size: fontSize,
        font: helveticaB,
        color: rgb(0, 0, 0),
      })
    axis = {...axis, y: axis.y - 23 }
  })

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  
  }

  export {createPinkSlip}