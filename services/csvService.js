import Papa from 'papaparse';

export default {
  async fetchData() {
    const response = await fetch('/dados.csv'); // Substitua pelo caminho correto do seu CSV
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: results => resolve(results.data),
        error: error => reject(error)
      });
    });
  }
};
