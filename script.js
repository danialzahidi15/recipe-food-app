const mealEl = document.getElementById("meals");
const favouriteContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const closePopupBtn = document.getElementById("close-popup");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );

  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

async function getMealBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  console.log(meals);

  return meals;
}

function addMeal(mealData, random = false) {
  console.log(mealData);

  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = `
          <div class="meal-header">
            ${random ? `<span class="random"> Random Recipe </span>` : ""}
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
            />
          </div>
          <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn"><i class="fas fa-heart"></i></button>
          </div>
    `;

  const btn = meal.querySelector(".meal-body .fav-btn");
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealToLS(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealEl.appendChild(meal);
}

function addMealToLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds == null ? [] : mealIds;
}

async function fetchFavMeals() {
  // clean the container
  favouriteContainer.innerHTML = "";

  const mealIds = getMealsFromLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);

    addFavMeal(meal);
  }
}

function addFavMeal(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
    <img
      src="${mealData.strMealThumb}"
      alt="${mealData.strMeal}"
    /><span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
      `;

  const btn = favMeal.querySelector(".clear");
  favMeal.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);

    fetchFavMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favouriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
  //clean
  mealInfoEl.innerHTML = "";

  //update meal info
  const mealEl = document.createElement("div");

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    }
  }

  mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img
      src="${mealData.strMealThumb}"
      alt="${mealData.strMeal}"
    />
    <p>${mealData.strInstructions}</p>
    <h3>Ingredients:</h3>
    <ul>
      ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
    </ul>
  `;

  mealInfoEl.appendChild(mealEl);

  //show the popup
  mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
  // clear container
  mealInfoEl.innerHTML = "";

  const search = searchTerm.value;

  const meals = await getMealBySearch(search);

  meals.forEach((meal) => {
    addMeal(meal);
  });
});

closePopupBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
