import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

function clearInputFile(f){
  if(f.value){
    try{
        f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
    }
    catch(err){ }
    if(f.value){ //for IE5 ~ IE10
      var form = document.createElement('form'),
          parentNode = f.parentNode, ref = f.nextSibling;
      form.appendChild(f);
      form.reset();
      parentNode.insertBefore(f,ref);
    }
  }
}

export default class NewBill {
  
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    e.preventDefault()
    let file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    //let file = e.target.files[0]
    let filePath = e.target.value.split(/\\/g)
    let fileName = filePath[filePath.length-1] 
    let fileExt = fileName.split(/\./g)[fileName.split(/\./g).length-1]
    console.log('file =', file)
    console.log('filePath =', filePath)
    console.log('fileName =', fileName)
    console.log('fileExt =', fileExt)
    if (fileExt == "jpg" || fileExt == "jpeg" || fileExt == "png") {

      const formData = new FormData()
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          console.log(fileUrl)
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
        }).catch(error => console.error(error))
    }
    else {
      alert("Vous devez choisir un fichier JPG, JPEG ou PNG comme justificatif.")
      /* let newFiles = new DataTransfer()
      e.target.files = newFiles.files       // Empty FileList */
      e.target.value = null     // Wrong file name not written on the page
    }
  }
  
  handleSubmit = e => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}