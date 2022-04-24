const { ref, computed, onMounted, onUpdated, nextTick } = Vue

const app = Vue.createApp({
  setup(props, context) {
    const input = ref({
      id: 'ML696969',
      name: 'Mizuki Lee',
      avatar: null,
      grade: 2,
      class: 'A',
      birthDate: new Date().toISOString().slice(0,10)
    })
    const canvas = ref(null)
    let ctx = null

    let templateImage = null
    const cropperImage = ref(null)
    let cropper = null
    let cropperModal = null
    const cropperModalEl = ref(null)

    const dateYear = ref(new Date().getFullYear())

    const birthDateComputed = computed(() => new Date(input.value.birthDate))

    const handleFile = (e) => {
      const reader = new FileReader()
      input.value.file = e.target.files[0]
      reader.onload = async (ee) => {
        await nextTick()
        cropperImage.value.onload = () => {
          cropper.destroy()
          cropperModal.show()
        }
        cropperImage.value.src = ee.target.result
      }
      reader.readAsDataURL(e.target.files[0])
    }

    const refresh = () => {
      ctx.font = '50px Arial'
      // Clear
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
      // Background
      ctx.drawImage(templateImage, 0, 0)
      // Draw avatar
      if(input.value.avatar) {
        const ratio = 650 / input.value.avatar.width
        const maxHeight = 900
        const y = (350 + (maxHeight - input.value.avatar.height * ratio) / 2)
        ctx.save()
        roundedImage(1200, y, 650, input.value.avatar.height * ratio, 0)
        ctx.clip()
        ctx.drawImage(input.value.avatar, 1200, y, 650, input.value.avatar.height * ratio)
        ctx.restore()
      }
      // Draw Texts
      const fonts = 'source-serif-pro'
      colorText(input.value.id, 1430, 1325, 'bold #000', '70px ' + fonts, 'left')
      colorText(input.value.grade, 559, 490, 'bold #000', '80px ' + fonts, 'left')
      colorText(input.value.class, 695, 490, 'bold #000', '80px ' + fonts, 'center')
      colorText(input.value.name, 350, 720, 'bold #000', '100px ' + fonts, 'left')
      colorText(birthDateComputed.value.getFullYear().toString(), 710, 865, 'bold #000', '70px ' + fonts, 'center')
      colorText((birthDateComputed.value.getMonth()+1).toString(), 890, 865, 'bold #000', '70px ' + fonts, 'center')
      colorText(birthDateComputed.value.getDate().toString(), 1015, 865, 'bold #000', '65px ' + fonts, 'center')
    }

    const colorText = (text, x, y, color, font, align) => {
      ctx.font = font
      ctx.textAlign = align
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
    }

    const download = () => {
      const link = document.createElement('a')
      link.download = ' Mizuki.png'
      link.href = canvas.value.toDataURL()
      link.click()
    }

    const loadImage = (url) => {
      return new Promise((resolve) => {
        const image = new Image()
        image.onload = () => {
          resolve(image)
        }
        image.src = url
      })
    }

    const roundedImage = (x, y, width, height, radius) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }

    const cropImage = () => {
      input.value.avatar = cropper.getCroppedCanvas()
      refresh()
      cropperModal.hide()
    }

    onMounted(async () => {
      await document.fonts.load('10pt source-serif-pro')
      templateImage = await loadImage('./images/template.jpg')
      input.value.avatar = await loadImage('./images/default_avatar.jpg')
      ctx = canvas.value.getContext('2d')
      refresh()
      cropper = new Cropper(cropperImage.value, {
        autoCropArea: 1
      })
      cropperModal = new bootstrap.Modal(cropperModalEl.value)
      cropperModalEl.value.addEventListener('shown.bs.modal', (event) => {
        cropper = new Cropper(cropperImage.value, {
          autoCropArea: 1
        })
      })
    })

    onUpdated(() => {
      ctx = canvas.value.getContext('2d')
      refresh()
    })

    return {
      input,
      canvas,
      ctx,
      dateYear,
      handleFile,
      refresh,
      download,
      cropperImage,
      cropperModal,
      cropperModalEl,
      cropImage
    }
  }
})

app.mount('#app')
