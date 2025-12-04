import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "pane"]

  connect() {
    // Ensure the first tab is active on load
    this.showTab(this.buttonTargets[0].dataset.tab)
  }

  switch(event) {
    const tabName = event.currentTarget.dataset.tab
    this.showTab(tabName)
  }

  showTab(tabName) {
    // Remove active class from all buttons and panes
    this.buttonTargets.forEach(button => button.classList.remove('active'))
    this.paneTargets.forEach(pane => pane.classList.remove('active'))
    
    // Add active class to selected button and pane
    const activeButton = this.buttonTargets.find(btn => btn.dataset.tab === tabName)
    const activePane = this.paneTargets.find(pane => pane.id === `${tabName}-tab`)
    
    if (activeButton) activeButton.classList.add('active')
    if (activePane) activePane.classList.add('active')
  }
}
