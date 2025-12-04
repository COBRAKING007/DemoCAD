import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "preview", "container"]

  preview(event) {
    const file = event.target.files[0]
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        if (this.hasPreviewTarget) {
          this.previewTarget.src = e.target.result
        } else {
          const img = document.createElement('img')
          img.src = e.target.result
          img.className = 'image-preview'
          img.dataset.imagePreviewTarget = 'preview'
          this.containerTarget.innerHTML = ''
          this.containerTarget.appendChild(img)
        }
        this.containerTarget.style.display = 'block'
      }
      
      reader.readAsDataURL(file)
    }
  }
}
