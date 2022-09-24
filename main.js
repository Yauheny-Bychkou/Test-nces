const buttonAction = document.querySelector(".button-action");
const startDateInput = document.querySelector(".start-date");
const endDateInput = document.querySelector(".end-date");
const selectCurrency = document.querySelector(".select");
const chartWrapper = document.querySelector(".chart");
const errorText = document.querySelector(".error");

buttonAction.addEventListener("click", async () => {
  errorText.innerHTML = "";
  chartWrapper.classList.remove("hidden");
  const selectCurrencyValue = selectCurrency.value;
  const startDateValue = startDateInput.value;
  const endDateValue = endDateInput.value;

  if (selectCurrencyValue !== "-1" && startDateValue !== "" && endDateValue !== "") {
    const allCurrencies = await getAllCurrency();
    const arrayCurrency = allCurrencies.filter(
      (currency) =>
        currency.Cur_Abbreviation === selectCurrencyValue &&
        getSeconds(currency.Cur_DateStart) < getSeconds(startDateValue) &&
        getSeconds(currency.Cur_DateEnd) > getSeconds(endDateValue)
    );
    if (arrayCurrency.length !== 0) {
      const arrayPrices = await getPriceCurrency(arrayCurrency[0].Cur_ID, startDateInput.value, endDateInput.value);
      const pricesValues = arrayPrices.map((item) => item.Cur_OfficialRate);
      const daysValues = arrayPrices.map((_, i) => i);
      const maxPrice = Math.max(...pricesValues);
      initChart(daysValues, pricesValues, maxPrice);
    } else {
      chartWrapper.classList.add("hidden");
      errorText.innerHTML = "Информация по изменению курса заданной валюты за заданный период времени отсутствует";
    }
  }
});

const getAllCurrency = async () => {
  const request = await fetch("https://www.nbrb.by/api/exrates/currencies");
  const response = await request.json();
  return response;
};
const getPriceCurrency = async (idCur, startDate, endDate) => {
  const request = await fetch(
    `https://www.nbrb.by/API/ExRates/Rates/Dynamics/${idCur}?startDate=${startDate}&endDate=${endDate}`
  );
  const response = await request.json();
  return response;
};
const getSeconds = (date) => {
  return new Date(date).getTime();
};

const initChart = (xValues, yValues, maxValue) => {
  new Chart("myChart", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(0,0,255,1.0)",
          borderColor: "rgba(0,0,255,0.1)",
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [{ ticks: { min: 0, max: maxValue } }],
      },
    },
  });
};
