import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["modal"]

    connect() {
        // Ensure modal is hidden on connect
        if (this.hasModalTarget) {
            this.modalTarget.style.display = 'none'
        }
    }

    confirm(event) {
        event.preventDefault()
        this.form = event.target.closest('form')
        this.showModal()
    }

    cancel() {
        this.hideModal()
        this.form = null
    }

    proceed() {
        if (this.form) {
            this.form.submit()
        }
        this.hideModal()
    }

    showModal() {
        this.modalTarget.style.display = 'flex'
        document.body.style.overflow = 'hidden'
    }

    hideModal() {
        this.modalTarget.style.display = 'none'
        document.body.style.overflow = ''
    }
}
