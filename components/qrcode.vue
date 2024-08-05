<template>
  <div>
    <canvas ref="qrcodeCanvas"></canvas>
  </div>
</template>

<script>
import QRCode from 'qrcode';

export default {
  props: {
    qrcodeData: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.generateQRCode();
  },
  methods: {
    generateQRCode() {
      const canvas = this.$refs.qrcodeCanvas;
      let width = 300; // 40% da largura da tela

      // Verifica se a tela é um dispositivo móvel
      if (window.matchMedia('(max-width: 768px)').matches) {
        width = window.innerWidth * 0.5; // 60% da largura da tela em dispositivos móveis
      }

      // Define o tamanho do canvas
      canvas.width = width;
      canvas.height = width; // Ajusta a altura para manter a proporção quadrada

      QRCode.toCanvas(canvas, this.qrcodeData, { width: width }, function (error) {
        if (error) console.error(error);
        console.log('QR Code generated!');
      });
    }
  }
};
</script>

<style>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
