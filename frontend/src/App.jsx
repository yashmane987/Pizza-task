import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const PizzaCustomizer = () => {
  const [pizzas, setPizzas] = useState([]);
  const [ingredients, setIngredients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [selectedSize, setSelectedSize] = useState("Medium");
  const [selectedCrust, setSelectedCrust] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedToppings, setSelectedToppings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [pizzasRes, ingredientsRes] = await Promise.all([
        fetch(
          "https://pizzaadmin.neosao.co.in/api/v1/mas/vx/pizzas?sign_key=akjsh3h28jais1poqpamvg1"
        ),
        fetch(
          "https://pizzaadmin.neosao.co.in/api/v1/mas/vx/ingredients?sign_key=akjsh3h28jais1poqpamvg1"
        )
      ]);

      const pizzasData = await pizzasRes.json();
      const ingredientsData = await ingredientsRes.json();

      setPizzas(pizzasData.data || []);
      setIngredients(ingredientsData.data || {});
    } catch (error) {
      console.error("Error fecting data of pizza and ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCustomization = (pizza) => {
    setSelectedPizza(pizza);
    setSelectedSize("Medium");
    setSelectedCrust("");
    setSelectedBase("");
    setSelectedToppings([]);
    setShowModal(true);
  };

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.find((t) => t.toppingsName === topping.toppingsName);
      if (exists) return prev.filter((t) => t.toppingsName !== topping.toppingsName);
      return [...prev, topping];
    });
  };

  const calculateTotal = () => {
    if (!selectedPizza) return 0;

    let total = 0;

    const sizePrice = selectedPizza.pizza_prices.find((p) => p.size === selectedSize);
    if (sizePrice) total += parseFloat(sizePrice.price);

    if (selectedCrust && ingredients?.crust) {
      const crust = ingredients.crust.find((c) => c.crustName === selectedCrust);
      if (crust) total += parseFloat(crust.price);
    }

    if (selectedBase && ingredients?.specialbases) {
      const base = ingredients.specialbases.find(
        (b) => b.specialbaseName === selectedBase
      );
      if (base) total += parseFloat(base.price);
    }

    selectedToppings.forEach((topping) => {
      const price = parseFloat(topping.price);
      const countAs = parseInt(topping.countAs) || 1;
      total += price * countAs;
    });

    return total.toFixed(2);
  };

  const confirmSelection = () => {
    const configuration = {
      pizza: selectedPizza.pizza_name,
      size: selectedSize,
      crust: selectedCrust || "None",
      specialBase: selectedBase || "None",
      toppings: selectedToppings.map((t) => t.toppingsName),
      totalPrice: parseFloat(calculateTotal())
    };

    console.log("Pizza Configuration:", configuration);
    alert("Order Confirmed!");
    setShowModal(false);
  };

  if (loading)
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 ">
        <div
          className="spinner-border text-warning"
          style={{ width: "3rem", height: "3rem" }}
        ></div>
      </div>
    );

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <header className="bg-warning text-white py-4 shadow d-flex justify-content-center">
        <div style={{ maxWidth: "1400px" }} className="w-100 text-center">
          <h1 className="fw-bold">Pizza Customizer</h1>
          <p className="mb-0">Build your perfect pizza!</p>
        </div>
      </header>

      {/* Pizza Grid */}
      <div className="container py-5 d-flex justify-content-center">
        <div className="row gy-4 w-100" style={{ maxWidth: "1400px" }}>
          {pizzas.map((pizza) => (
            <div key={pizza.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="ratio ratio-1x1">
                  <img
                    src={pizza.pizza_image || "https://via.placeholder.com/300"}
                    className="rounded-top"
                    style={{ objectFit: "cover" }}
                    alt={pizza.pizza_name}
                  />
                </div>

                <div className="card-body">
                  <h5 className="fw-bold">{pizza.pizza_name}</h5>
                  <p className="text-muted small">
                    {pizza.category?.category_name}
                  </p>

                  <ul className="list-group mb-3">
                    {pizza.pizza_prices.map((p) => (
                      <li
                        className="list-group-item d-flex justify-content-between"
                        key={p.size}
                      >
                        <span>{p.size}</span>
                        <span className="text-warning fw-bold">${p.price}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className="btn btn-warning w-100 fw-bold"
                    onClick={() => openCustomization(pizza)}
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedPizza && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-warning text-white">
                <h5 className="modal-title fw-bold">
                  Customize {selectedPizza.pizza_name}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                {/* Size */}
                <div className="mb-3">
                  <label className="fw-bold mb-2">Select Size *</label>
                  <select
                    className="form-select"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {selectedPizza.pizza_prices.map((p) => (
                      <option key={p.size} value={p.size}>
                        {p.size} - ${p.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crust */}
                {ingredients?.crust && (
                  <div className="mb-3">
                    <label className="fw-bold mb-2">Choose Crust</label>
                    <select
                      className="form-select"
                      value={selectedCrust}
                      onChange={(e) => setSelectedCrust(e.target.value)}
                    >
                      <option value="">None</option>
                      {ingredients.crust.map((c) => (
                        <option
                          key={c.crustCode}
                          value={c.crustName}
                        >
                          {c.crustName} - ${c.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bases */}
                {ingredients?.specialbases && (
                  <div className="mb-3">
                    <label className="fw-bold mb-2">Special Bases</label>
                    <select
                      className="form-select"
                      value={selectedBase}
                      onChange={(e) => setSelectedBase(e.target.value)}
                    >
                      <option value="">None</option>
                      {ingredients.specialbases.map((b) => (
                        <option
                          key={b.specialbaseCode}
                          value={b.specialbaseName}
                        >
                          {b.specialbaseName} - ${b.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Toppings */}
                <div className="mb-3">
                  <label className="fw-bold mb-2">Toppings</label>
                  <div
                    className="border p-3 rounded"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {ingredients?.toppings?.countAsOne?.map((t, index) => (
                      <div className="form-check mb-2" key={index}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedToppings.some(
                            (s) => s.toppingsName === t.toppingsName
                          )}
                          onChange={() => toggleTopping(t)}
                        />
                        <label className="form-check-label">
                          {t.toppingsName} - ${t.price}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Price */}
                <div className="border-top pt-3 mt-3 d-flex justify-content-between">
                  <h4>Total:</h4>
                  <h4 className="text-warning fw-bold">
                    ${calculateTotal()}
                  </h4>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-warning fw-bold"
                  onClick={confirmSelection}
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PizzaCustomizer;
