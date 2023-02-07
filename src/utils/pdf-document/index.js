import { PDFDocument, StandardFonts, rgb} from 'pdf-lib'


const createPinkSlip = async (text) => { // Create a function to create the pink slip
  const pdfDoc = await PDFDocument.create()
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const page = pdfDoc.addPage()
  const { width, height } = page.getSize()
    const fontSize = 14
    //to add the pink color to the background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(1, 0.776, 0.960),
    })
  
  page.drawText(text, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  })

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  
  }

  export {createPinkSlip}