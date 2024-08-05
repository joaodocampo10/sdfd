<template>
  <div>
    <h1>Make a POST Request</h1>
    <button @click="makePostRequest">Send Request</button>
    <div v-if="response">
      <h2>Response:</h2>

      <p>{{ response.message }}</p>

      <pre>{{ response }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      response: null
    }
  },
  methods: {
    async makePostRequest() {
      const secretKey = 'sk_live_XzNwTn8o3M2dHZOp1crA1TuQKcrUokXwsbyyn6s382' // Substitua pela sua chave secreta real
      const base64Value = btoa(`${secretKey}:x`)
      console.log(base64Value);

      try {
        const options = {
          method: 'POST',
          url: 'https://api.zyonpay.com/v1/transactions',
          headers: {
            authorization: 'Basic ' + base64Value
          },
          data: {
            customer: {
              document: {number: '92547502046', type: 'cpf'},
              name: 'clientName',
              email: 'mail@gmail.com'
            },
            amount: 4900,
            paymentMethod: 'pix',
            items: [
              {
                tangible: false,
                title: 'itemTitle',
                unitPrice: 4900,
                quantity: 1
              }
            ]
          }
        }

        const response = await this.$axios(options)
        this.response = { message: 'Transação realizada com sucesso!', data: response.data };
      } catch (error) {
        console.error(error)
        this.response = { error: true, message: error.response ? error.response.data : 'Ocorreu um erro ao processar a solicitação.' };
      }
    }
  }
}
</script>

<style>
/* Adicione seu estilo aqui, se necessário */
</style>
