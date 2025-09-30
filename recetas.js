import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, addDoc, setDoc, deleteDoc, onSnapshot, collection, updateDoc, increment, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// CONFIGURACIÓN DE FIREBASE (Asumiendo que es la misma que en main.js)
const firebaseConfig = {
    apiKey: "AIzaSyDaeiHDKjK_DkdYNF9FvL8aMGINPGvU9uc",
    authDomain: "ventas-casino.firebaseapp.com",
    projectId: "ventas-casino",
    storageBucket: "ventas-casino.firebasestorage.app",
    messagingSenderId: "683247450522",
    appId: "1:683247450522:web:87a57e190d2c252d0a6223",
    measurementId: "G-XYG0ZNEQ61"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Colecciones compartidas
const SHARED_PRODUCTS_COLLECTION = 'products';
const SHARED_RECIPES_COLLECTION = 'recipes'; // ¡NUEVA COLECCIÓN!

const productSelect = document.getElementById('product-select');
const recipeForm = document.getElementById('recipe-form');
const componentsContainer = document.getElementById('components-container');
const addComponentBtn = document.getElementById('add-component-btn');
const recipesListContainer = document.getElementById('recipes-list-container');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

let allProducts = [];
let allRecipes = [];

function showModal(message) {
    if (modal && modalMessage) {
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
    }
}
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
        if (modal) modal.classList.add('hidden');
    });
}

// ------------------------------------------------------------
// 1. Carga de Datos y Listeners
// ------------------------------------------------------------

function setupRealtimeListeners() {
    // Escuchar todos los productos (Insumos, Procesados, Finales)
    const productsCollection = collection(db, SHARED_PRODUCTS_COLLECTION);
    onSnapshot(productsCollection, (snapshot) => {
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProductSelect(allProducts);
    }, (error) => {
        console.error("Error al escuchar productos:", error);
    });

    // Escuchar todas las recetas
    const recipesCollection = collection(db, SHARED_RECIPES_COLLECTION);
    onSnapshot(recipesCollection, (snapshot) => {
        allRecipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderRecipesList(allRecipes);
    }, (error) => {
        console.error("Error al escuchar recetas:", error);
    });
}

function renderProductSelect(products) {
    if (!productSelect) return;
    productSelect.innerHTML = '<option value="">Seleccionar Producto...</option>';
    
    // Solo mostramos Productos Finales y Procesados (los que necesitan receta)
    const productTypes = products.filter(p => p.type !== 'insumo'); 
    
    productTypes.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (${product.type === 'procesado' ? 'Procesado' : 'Final'})`;
        productSelect.appendChild(option);
    });
}

// ------------------------------------------------------------
// 2. Gestión de Componentes (Items de la Receta)
// ------------------------------------------------------------

function addComponentInput(component = null) {
    if (!componentsContainer) return;
    
    const div = document.createElement('div');
    div.className = "flex space-x-2 items-center";
    
    // Select para Insumos, Procesados o Productos Finales
    const select = document.createElement('select');
    select.className = "component-select flex-grow px-2 py-1 border rounded-lg";
    
    // Se muestran TODOS los productos (Insumos, Procesados y Finales) como componentes
    select.innerHTML = '<option value="">Seleccionar Componente...</option>';
    allProducts.forEach(product => {
        const typeLabel = product.type === 'insumo' ? 'Insumo' : (product.type === 'procesado' ? 'Procesado' : 'Final');
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} [${typeLabel}]`;
        select.appendChild(option);
    });
    
    // Input para la cantidad
    const quantityInput = document.createElement('input');
    quantityInput.type = "number";
    quantityInput.placeholder = "Cantidad";
    quantityInput.step = "0.001";
    quantityInput.required = true;
    quantityInput.className = "w-24 px-2 py-1 border rounded-lg";
    
    // Botón para eliminar
    const removeBtn = document.createElement('button');
    removeBtn.type = "button";
    removeBtn.innerHTML = `<i class="fas fa-trash-alt text-red-500"></i>`;
    removeBtn.className = "hover:text-red-700 p-1";
    removeBtn.addEventListener('click', () => div.remove());
    
    if (component) {
        select.value = component.componentId;
        quantityInput.value = component.quantity;
    }
    
    div.appendChild(select);
    div.appendChild(quantityInput);
    div.appendChild(removeBtn);
    componentsContainer.appendChild(div);
}

if (addComponentBtn) {
    addComponentBtn.addEventListener('click', () => addComponentInput());
}

// ------------------------------------------------------------
// 3. Guardar Receta
// ------------------------------------------------------------

if (recipeForm) {
    recipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productId = productSelect.value;
        const productType = document.querySelector('input[name="product_type"]:checked')?.value;
        const recipeId = document.getElementById('recipe-id').value;

        if (!productId || !productType) {
            showModal("Selecciona un producto y su tipo.");
            return;
        }

        const components = [];
        const componentSelects = componentsContainer.querySelectorAll('.component-select');
        const quantityInputs = componentsContainer.querySelectorAll('input[type="number"]');

        if (componentSelects.length === 0) {
            showModal("Una receta debe tener al menos un componente.");
            return;
        }

        let isValid = true;
        componentSelects.forEach((select, index) => {
            const componentId = select.value;
            const quantity = parseFloat(quantityInputs[index].value);
            
            if (!componentId || isNaN(quantity) || quantity <= 0) {
                isValid = false;
            }
            
            // Seguridad: Un producto no puede ser componente de sí mismo
            if (componentId === productId) {
                isValid = false;
                showModal("Un producto no puede ser componente de su propia receta.");
            }
            
            // Buscamos el tipo del componente
            const componentData = allProducts.find(p => p.id === componentId);
            
            components.push({
                componentId: componentId,
                quantity: quantity,
                componentType: componentData ? componentData.type : 'insumo' // Asumir insumo si no se encuentra (debería encontrarse)
            });
        });

        if (!isValid) {
            showModal("Revisa que todos los campos de componente tengan valores válidos (ID y Cantidad > 0).");
            return;
        }
        
        const recipeData = {
            productId: productId,
            productName: productSelect.options[productSelect.selectedIndex].text.split(' (')[0],
            productType: productType,
            components: components,
            timestamp: new Date()
        };

        try {
            // Actualizar el tipo del producto en la colección products (si no es 'insumo', es 'procesado' o 'final')
            const productRef = doc(db, SHARED_PRODUCTS_COLLECTION, productId);
            await updateDoc(productRef, { type: productType });
            
            // Guardar la receta
            if (recipeId) {
                await setDoc(doc(db, SHARED_RECIPES_COLLECTION, recipeId), recipeData);
                showModal("Receta actualizada con éxito.");
            } else {
                await addDoc(collection(db, SHARED_RECIPES_COLLECTION), recipeData);
                showModal("Receta guardada con éxito.");
            }

            recipeForm.reset();
            componentsContainer.innerHTML = '';
            document.getElementById('recipe-id').value = '';
        } catch (error) {
            console.error("Error al guardar la receta:", error);
            showModal("Error al guardar la receta. Intenta de nuevo.");
        }
    });
}

// ------------------------------------------------------------
// 4. Listar y Editar Recetas
// ------------------------------------------------------------

function renderRecipesList(recipes) {
    if (!recipesListContainer) return;
    recipesListContainer.innerHTML = '';
    
    recipes.forEach(recipe => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "bg-gray-100 p-3 rounded-lg flex items-center justify-between";
        
        const componentsText = recipe.components.map(c => {
            const product = allProducts.find(p => p.id === c.componentId);
            return `${c.quantity}x ${product ? product.name : 'Desconocido'}`;
        }).join(', ');

        itemDiv.innerHTML = `
        <div class="flex-grow">
            <span class="font-semibold text-gray-800">${recipe.productName} [${recipe.productType.toUpperCase()}]</span>
            <p class="text-sm text-gray-600">Requiere: ${componentsText}</p>
        </div>
        <div class="flex space-x-2">
            <button data-id="${recipe.id}" class="edit-recipe-btn px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors">
                <i class="fas fa-edit"></i>
            </button>
            <button data-id="${recipe.id}" class="delete-recipe-btn px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        `;
        recipesListContainer.appendChild(itemDiv);
    });
    
    document.querySelectorAll('.edit-recipe-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const recipeId = e.currentTarget.dataset.id;
        editRecipe(recipeId);
    }));
    
    document.querySelectorAll('.delete-recipe-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const recipeId = e.currentTarget.dataset.id;
        deleteRecipe(recipeId);
    }));
}

function editRecipe(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    document.getElementById('recipe-id').value = recipe.id;
    productSelect.value = recipe.productId;
    
    document.getElementById(`type_${recipe.productType}`).checked = true;
    
    componentsContainer.innerHTML = '';
    recipe.components.forEach(component => addComponentInput(component));
    
    window.scrollTo(0, 0); // Ir al inicio del formulario
}

async function deleteRecipe(recipeId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta receta?')) return;
    
    try {
        await deleteDoc(doc(db, SHARED_RECIPES_COLLECTION, recipeId));
        showModal("Receta eliminada con éxito.");
    } catch (error) {
        console.error("Error al eliminar la receta:", error);
        showModal("Error al eliminar la receta.");
    }
}

document.addEventListener('DOMContentLoaded', setupRealtimeListeners);