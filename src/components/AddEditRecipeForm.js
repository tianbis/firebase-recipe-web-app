import { useEffect, useState } from 'react';
import ImageUploadPreview from './ImageUploadPreview';

const AddEditRecipeForm = ({
  existingRecipe,
  handleAddRecipe,
  handleUpdateRecipe,
  handleEditRecipeCancel,
  handleDeleteRecipe,
}) => {
  useEffect(() => {
    if (existingRecipe) {
      setName(existingRecipe.name);
      setCategory(existingRecipe.category);
      setDirections(existingRecipe.directions);
      setPublishDate(existingRecipe.publishDate.toISOString().split('T')[0]);
      setIngredients(existingRecipe.ingredients);
      setImageUrl(existingRecipe.imageUrl);
    } else {
      resetForm();
    }
  }, [existingRecipe]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState();
  const [directions, setDirections] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);

  function handleRecipeFormSubmit(e) {
    e.preventDefault();
    if (ingredients.length === 0) {
      alert('Ingredients cannot be empty, please add at least one');
      return;
    }

    if (!imageUrl) {
      alert('Missing recipe image. Please add a recipe image');
      return;
    }

    const isPublished = new Date(publishDate) <= new Date() ? true : false;

    const newRecipe = {
      name,
      category,
      directions,
      // publishDate: new Date(publishDate).getTime() / 1000,
      publishDate: new Date(publishDate),
      isPublished,
      ingredients,
      imageUrl,
    };

    if (existingRecipe) {
      handleUpdateRecipe(newRecipe, existingRecipe.id);
    } else {
      handleAddRecipe(newRecipe);
    }

    resetForm();
  }

  function handleAddIngredient(e) {
    if (e.key && e.key !== 'Enter') return;
    e.preventDefault();
    if (!ingredientName) {
      alert('missing ingredient name, please double check');
      return;
    }

    setIngredients([...ingredients, ingredientName]);
    setIngredientName('');
  }

  function resetForm() {
    setName('');
    setCategory('');
    setDirections('');
    setPublishDate('');
    setIngredients([]);
    setImageUrl('');
  }
  return (
    <form className="add-edit-recipe-form-container" onSubmit={handleRecipeFormSubmit}>
      {existingRecipe ? <h2>Update the recipe</h2> : <h2>Add a New Recipe</h2>}
      <div className="top-form-section">
        <div className="image-input-box">
          Recipe Image
          <ImageUploadPreview
            basePath="recipes"
            existingImageUrl={imageUrl}
            handleUploadFinished={(downloadUrl) => setImageUrl(downloadUrl)}
            handleUploadCancel={() => setImageUrl('')}
          />
        </div>
        <div className="fields">
          <label className="recipe-label input-label">
            Recipe Name:
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-text"
            />
          </label>
          <label className="recipe-label input-label">
            Category:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select"
              required
            >
              <option value=""></option>
              <option value="breadsSandwichesAndPizza">Breads, Sandwiches and Pizza</option>
              <option value="eggsAndBreakfast">Eggs & Breakfast</option>
              <option value="dessertsAndBakedGoods">Desserts & Baked Goods</option>
              <option value="fishAndSeafood">Fish & Seafood</option>
              <option value="vegetables">Vegetables</option>
            </select>
          </label>
          <label className="recipe-label input-label">
            Directions:
            <textarea
              required
              value={directions}
              onChange={(e) => setDirections(e.target.value)}
              className="input-text directions"
            ></textarea>
          </label>
          <label className="recipe-label input-label">
            Publish Date:
            <input
              type="date"
              required
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="input-text"
            />
          </label>
        </div>
      </div>
      <div className="ingredients-list">
        <h3 className="text-center">Ingredients</h3>
        <table className="ingredients-table">
          <thead>
            <tr>
              <th className="table-header">Ingredient</th>
              <th className="table-header">Delete</th>
            </tr>
          </thead>
          <tbody>
            {ingredients && ingredients.length > 0
              ? ingredients.map((ingredient) => {
                  return (
                    <tr key={ingredient}>
                      <td className="table-data text-center">{ingredient}</td>
                      <td className="ingredient-delete-box">
                        <button type="button" className="secondary-button ingredient-delete-button">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
        {ingredients && ingredients.length === 0 ? (
          <h3 className="text-center no-ingredients">No ingredients added yet</h3>
        ) : null}
        <div className="ingredient-form">
          <label className="ingredient-label">
            Ingredient:
            <input
              type="text"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              onKeyUp={handleAddIngredient}
              className="input-text"
              placeholder="ex. 1 cup of sugar"
            />
          </label>
          <button
            type="button"
            className="primary-button add-ingredient-button"
            onClick={handleAddIngredient}
          >
            Add Ingredient
          </button>
        </div>
      </div>
      <div className="action-buttons">
        <button type="submit" className="primary-button action-button">
          {existingRecipe ? 'Update Recipe' : 'Create Recipe'}
        </button>
        {existingRecipe ? (
          <>
            {' '}
            <button
              type="button"
              onClick={handleEditRecipeCancel}
              className="primary-button action-button"
            >
              Cancel
            </button>
            <button
              className="primary-button action-button"
              type="button"
              onClick={() => handleDeleteRecipe(existingRecipe.id)}
            >
              Delete
            </button>
          </>
        ) : null}
      </div>
    </form>
  );
};

export default AddEditRecipeForm;
