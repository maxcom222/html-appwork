import * as SwalPlugin from 'sweetalert2/dist/sweetalert2.js'

const Swal = SwalPlugin.mixin({
  buttonsStyling: false,
  customClass: {
    confirmButton: 'btn btn-primary btn-lg',
    cancelButton: 'btn btn-default btn-lg'
  }
})

export { Swal };
