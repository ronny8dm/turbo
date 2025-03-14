class FeatureManager {
    constructor(manager) {
      this.manager = manager;
      this.featureCount = 0;
    }
  
    addFeature() {
      const featureInput = document.getElementById("feature-input");
      const featureValue = featureInput.value.trim();
      if (!featureValue) return;
  
      const li = document.createElement("li");
      li.textContent = featureValue;
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "ml-2 text-red-600";
      removeBtn.onclick = () => {
        li.remove();
        document.getElementById(`hidden-feature-${this.featureCount}`).remove();
      };
      li.appendChild(removeBtn);
      document.getElementById("features-list").appendChild(li);
  
      this.featureCount++;
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "features";
      hiddenInput.value = featureValue;
      hiddenInput.id = `hidden-feature-${this.featureCount}`;
      document.getElementById("features-hidden-inputs").appendChild(hiddenInput);
  
      featureInput.value = "";
    }
  
    addFeatureToEditForm() {
      const featureName = document.getElementById("new-feature-name").value.trim();
      if (!featureName) return alert("Please enter a feature name");
  
      const li = document.createElement("li");
      li.className = "flex justify-between items-center mb-2";
      li.innerHTML = `<span>${featureName}</span><button type="button" class="text-red-600 hover:text-red-800">Remove</button>`;
      const removeBtn = li.querySelector("button");
      removeBtn.addEventListener("click", () => {
        li.remove();
        document.querySelector(`input[value="${featureName}"][name="edit-features"]`)?.remove();
      });
      document.getElementById("edit-features-list").appendChild(li);
  
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "edit-features";
      hiddenInput.value = featureName;
      document.getElementById("edit-features-hidden-inputs").appendChild(hiddenInput);
  
      document.getElementById("new-feature-name").value = "";
    }
  
    populateFeatures(features) {
      const featuresList = document.getElementById("edit-features-list");
      const featuresHiddenInputs = document.getElementById("edit-features-hidden-inputs");
      featuresList.innerHTML = "";
      featuresHiddenInputs.innerHTML = "";
  
      features?.forEach((feature) => {
        if (!feature.name) return;
        const li = document.createElement("li");
        li.className = "flex justify-between items-center mb-2";
        li.innerHTML = `<span>${feature.name}</span><button type="button" class="text-red-600 hover:text-red-800">Remove</button>`;
        const removeBtn = li.querySelector("button");
        removeBtn.addEventListener("click", () => {
          li.remove();
          if (feature.id) {
            const deleteInput = document.createElement("input");
            deleteInput.type = "hidden";
            deleteInput.name = "edit-features-delete";
            deleteInput.value = feature.id;
            featuresHiddenInputs.appendChild(deleteInput);
          }
        });
        featuresList.appendChild(li);
  
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "edit-features-existing";
        hiddenInput.value = feature.id;
        hiddenInput.dataset.name = feature.name;
        featuresHiddenInputs.appendChild(hiddenInput);
      });
    }
  }
  
  export default FeatureManager;