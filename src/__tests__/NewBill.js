/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"


jest.mock("../app/store", () => mockStore)
window.alert = jest.fn();

describe("Given I am connected as an employee on NewBill page", () => {
  describe("When I do not fill required fields and I click on 'Send'", () => {
    test("Then I am still on NewBill page", async () => {
      
      document.body.innerHTML = NewBillUI()

      const dateInputNewBill = screen.getByTestId('datepicker')
      expect(dateInputNewBill.innerHTML).toBe("")
      const amountInputNewBill = screen.getByTestId('amount')
      expect(amountInputNewBill.innerHTML).toBe("")
      const pctInputNewBill = screen.getByTestId('pct')
      expect(pctInputNewBill.innerHTML).toBe("")

      const form = screen.getByTestId("form-new-bill");
      const handleSubmitNewBill = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmitNewBill);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();

      const newBillTitle = screen.getByText('Envoyer une note de frais')
      expect(newBillTitle).toBeTruthy()
    })
  })

  describe("When the required inputs are filled and I click on 'Send'", () => {
    test("Then the form is submitted and I go on Bills page", () => {

      document.body.innerHTML = NewBillUI()

      const newBillInputData = {
        date: "2021-12-31",
        amount: "123",
        pct: "25"
      }

      const dateInputNewBill = screen.getByTestId('datepicker')
      fireEvent.change(dateInputNewBill, { target: { value: newBillInputData.date } })
      expect(dateInputNewBill.value).toBe(newBillInputData.date)

      const amountInputNewBill = screen.getByTestId('amount')
      fireEvent.change(amountInputNewBill, { target: { value: newBillInputData.amount } })
      expect(amountInputNewBill.value).toBe(newBillInputData.amount)

      const pctInputNewBill = screen.getByTestId('pct')
      fireEvent.change(pctInputNewBill, { target: { value: newBillInputData.pct } })
      expect(pctInputNewBill.value).toBe(newBillInputData.pct)

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newCreatedBill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      const form = screen.getByTestId("form-new-bill");
      const handleSubmitNewBill = jest.fn((e) => newCreatedBill.handleSubmit(e))
      form.addEventListener("submit", handleSubmitNewBill);
      fireEvent.submit(form);
      expect(handleSubmitNewBill).toHaveBeenCalled()

      const billsTitle = screen.getByText('Mes notes de frais')
      expect(billsTitle).toBeTruthy()
      const billsTableBody = screen.getByTestId('tbody')
      expect(billsTableBody).toBeTruthy()
    })
  })

  describe("When all inputs are filled (required or not) and I click on 'Send'", () => {
    test("Then all inputs are correct, the form is submitted and I go on Bills page", async () => {

      window.alert.mockClear();

      document.body.innerHTML = NewBillUI()

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newCreatedBill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      const newBillInputData = {
        type: "Services en ligne",
        name: "test NewBill",
        date: "2021-12-31",
        amount: "123",
        vat: "60",
        pct: "25",
        commentary: "This is a test on NewBill",
        file: new File(['img'], 'test.png', { type: 'image/png' })
      }

      const typeInputNewBill = screen.getByTestId('expense-type')
      fireEvent.change(typeInputNewBill, { target: { value: newBillInputData.type } })
      expect(typeInputNewBill.value).toBe(newBillInputData.type)

      const nameInputNewBill = screen.getByTestId('expense-name')
      fireEvent.change(nameInputNewBill, { target: { value: newBillInputData.name } })
      expect(nameInputNewBill.value).toBe(newBillInputData.name)

      const dateInputNewBill = screen.getByTestId('datepicker')
      fireEvent.change(dateInputNewBill, { target: { value: newBillInputData.date } })
      expect(dateInputNewBill.value).toBe(newBillInputData.date)

      const amountInputNewBill = screen.getByTestId('amount')
      fireEvent.change(amountInputNewBill, { target: { value: newBillInputData.amount } })
      expect(amountInputNewBill.value).toBe(newBillInputData.amount)

      const vatInputNewBill = screen.getByTestId('vat')
      fireEvent.change(vatInputNewBill, { target: { value: newBillInputData.vat } })
      expect(vatInputNewBill.value).toBe(newBillInputData.vat)

      const pctInputNewBill = screen.getByTestId('pct')
      fireEvent.change(pctInputNewBill, { target: { value: newBillInputData.pct } })
      expect(pctInputNewBill.value).toBe(newBillInputData.pct)

      const commentaryInputNewBill = screen.getByTestId('commentary')
      fireEvent.change(commentaryInputNewBill, { target: { value: newBillInputData.commentary } })
      expect(commentaryInputNewBill.value).toBe(newBillInputData.commentary)

      const form = screen.getByTestId('form-new-bill')
      const handleSubmitNewBill = jest.fn((e) => newCreatedBill.handleSubmit(e))
      form.addEventListener("submit", handleSubmitNewBill)

      const fileChangeNewBill = screen.getByTestId('file')
      const handleChangeFileButton = jest.fn((e) => newCreatedBill.handleChangeFile(e))
      fileChangeNewBill.addEventListener('change', handleChangeFileButton)
      await waitFor(() => {
        userEvent.upload(fileChangeNewBill, newBillInputData.file)
      })
      
      expect(handleChangeFileButton).toHaveBeenCalled()
      expect(fileChangeNewBill.files[0]).toBe(newBillInputData.file)
      expect(fileChangeNewBill.files.item(0)).toBe(newBillInputData.file)
      expect(fileChangeNewBill.files).toHaveLength(1)

      fireEvent.submit(form)
      expect(handleSubmitNewBill).toHaveBeenCalled()

      const billsTitle = screen.getByText('Mes notes de frais')
      expect(billsTitle).toBeTruthy()
      const billsTableBody = screen.getByTestId('tbody')
      expect(billsTableBody).toBeTruthy()
    })
  })

  describe("When I choose a file with an unaccepted extension", () => {
    test("Then an alert window should appear and the input remains empty", async () => {

      window.alert.mockClear();

      document.body.innerHTML = NewBillUI()

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newCreatedBill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      const newBillInputData = {
        file: new File(['txt'], 'test.txt', { type: 'text/plain' })
      }

      const fileChangeNewBill = screen.getByTestId('file')
      const handleChangeFileButton = jest.fn((e) => newCreatedBill.handleChangeFile(e))
      fileChangeNewBill.addEventListener('change', handleChangeFileButton)
      window.alert = jest.fn()

      await waitFor(() => {
        userEvent.upload(fileChangeNewBill, newBillInputData.file)
      })
      expect(handleChangeFileButton).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalled()
      expect(fileChangeNewBill.value).toBe("")
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I fill required fields in correct format and I submit the new bill", () => {
    test("Then it adds a new bill from mock API POST", async () => {
      /* const newBillInputData = {
        "id": "AbC0dEf11Gh2IjK3lM4nOp5Qr6St7Uv8WxY9z",
        "vat": "",
        "amount": 100,
        "name": "test POST New Bill",
        "fileName": "test.png",
        "commentary": "",
        "pct": 20,
        "type": "",
        "email": "",
        "fileUrl": "https://test.storage.tld/v0/b/test.png",
        "date": "2022-02-22",
        "status": "",
        "commentAdmin": ""
      }
      const spyPost = jest.spyOn(mockStore, "post")
      const bills = await mockStore.post(newBillInputData)
      expect(spyPost).toHaveBeenCalled()
      expect(bills.data).toHaveLength(1) */

      /* // FROM DASHBOARD
      localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Dashboard)
      await waitFor(() => screen.getByText("Validations"))
      const contentPending  = await screen.getByText("En attente (1)")
      expect(contentPending).toBeTruthy()
      const contentRefused  = await screen.getByText("Refusé (2)")
      expect(contentRefused).toBeTruthy()
      expect(screen.getByTestId("big-billed-icon")).toBeTruthy() */
    })

    describe("When an error occurs on API", () => {

      /* beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router() 
      }) */

      test("Then it adds a new bill to an API and fails with 404 message error", async () => {
        /* store.post.mockImplementationOnce(() => {
          return {
            list : () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        }) */
        /* store.post.mockImplementationOnce(() => 
          Promise.reject(new Error("Erreur 500"))
        )
        window.onNavigate(ROUTES_PATH.NewBill)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy() */

        /* mockStore.bills.mockImplementationOnce(() => {
          return {
            create : jest.fn().mockRejectedValueOnce(false)
          }
        }) */

        /* mockStore.bills.mockImplementationOnce(() => {
          return {
            create : () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        }) */

        /* const newBillInputData = {
          "id": "AbC0dEf11Gh2IjK3lM4nOp5Qr6St7Uv8WxY9z",
          "vat": "",
          "amount": 100,
          "name": "test POST New Bill",
          "fileName": "test.png",
          "commentary": "",
          "pct": 20,
          "type": "",
          "email": "",
          "fileUrl": "https://test.storage.tld/v0/b/test.png",
          "date": "2022-02-22",
          "status": "",
          "commentAdmin": ""
        } */

        /* window.onNavigate(ROUTES_PATH.NewBill)
        await new Promise(process.nextTick)
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy() */
      })

      test("Then it adds a new bill to an API and fails with 500 message error", async () => {
        /* store.post.mockImplementationOnce(() => {
          return {
            list : () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        }) */
        /* store.post.mockImplementationOnce(() => 
          Promise.reject(new Error("Erreur 500"))
        )
        window.onNavigate(ROUTES_PATH.NewBill)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy() */
      })
    })
  })
})