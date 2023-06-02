let cmodal = null
let callback = null

function showTemplateModal(id){
    const modal = document.getElementById(id)
    modal.style.display = "flex"
    modal.removeAttribute('aria-hidden')
    modal.setAttribute('aria-modal', 'true')
    document.querySelector("body").style.overflow = "hidden"

    // Auto focus
    $('input:first').focus()

    window.cmodal = modal
    window.cmodal.addEventListener('click', closeTemplateModal)
    forEach(window.cmodal.getElementsByClassName('close-modal'), item => item.addEventListener('click', closeTemplateModal))
    window.cmodal.querySelector('.modal-wrapper').addEventListener('click', stopPropagation)
}

function closeTemplateModal(e){
    const cmodal = window.cmodal
    if(!cmodal) return
    if(e) e.preventDefault()
    cmodal.setAttribute('aria-hidden', 'true')
    cmodal.removeAttribute('aria-modal')
    cmodal.removeEventListener('click', closeTemplateModal)
    cmodal.querySelector('.modal-wrapper').removeEventListener('click', stopPropagation)
    forEach(cmodal.getElementsByClassName('close-modal'), item => item.removeEventListener('click', stopPropagation))
    cmodal.addEventListener('animationend', hideTemplateModal)
    document.querySelector("body").style.overflow = "auto"
}

function hideTemplateModal(){
    const cmodal = window.cmodal
    cmodal.style.display = 'none'
    cmodal.removeEventListener('animationend', hideTemplateModal)
    if(window.callback) window.callback()
    window.cmodal = null
    document.querySelector("body").style.overflow = "auto"
}

function stopPropagation(e){ e.stopPropagation() }

function forEach(array, func){
    for (let i = 0; i < array.length; i++) {
        func(array[i])
    }
}

window.addEventListener('keydown', (e) => {
    if(e.key === "Escape" || e.key === "Esc") closeTemplateModal(e)
})

const modals = new Vue({
    el: '#modals',
    components: {
        modal: {
            template: `
            <aside class="modal" aria-hidden="true" role="dialog" aria-modal="false" style="display: none;">
                <div class="modal-wrapper">
                    <slot></slot>
                </div>
            </aside>`
        }
    },
    methods: {
        show(id, closing = null){
            id = id.indexOf('#') === -1 ? id : id.substring(1)
            showTemplateModal(id)
            window.callback = closing
        },
        closeCurrent(){ closeTemplateModal(null) }
    }
})