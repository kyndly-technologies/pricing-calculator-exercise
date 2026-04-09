(function () {
  function formatCurrency(value, digits) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(value);
  }

  function calcTierCost(tier, membership, concierge, payment, config) {
    return tier.platform +
      tier.pepm * membership +
      (concierge ? config.concierge_pepm : 0) * membership +
      (payment ? config.payment_processing_pepm : 0) * membership;
  }

  function findBestTier(tiers, membership, concierge, payment, config) {
    var bestTier = tiers[0];
    var bestCost = Number.POSITIVE_INFINITY;

    tiers.forEach(function (tier) {
      var cost = calcTierCost(tier, membership, concierge, payment, config);
      if (cost < bestCost) {
        bestCost = cost;
        bestTier = tier;
      }
    });

    return bestTier.id;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function initCalculator() {
    var root = document.querySelector("[data-calculator-config]");
    if (!root) return;

    var config = JSON.parse(root.dataset.calculatorConfig);
    var membershipSlider = document.getElementById("membership-range");
    var membershipInput = document.getElementById("membership-input");
    var adminSlider = document.getElementById("admin-range");
    var ratioSlider = document.getElementById("ratio-range");
    var ratioInput = document.getElementById("ratio-input");
    var conciergeInput = document.getElementById("concierge-input");
    var paymentInput = document.getElementById("payment-input");
    var resetButton = document.getElementById("reset-tier");
    var tierButtons = Array.prototype.slice.call(document.querySelectorAll("[data-tier-button]"));

    var state = {
      membership: config.default_membership,
      adminPepm: config.default_admin_pepm,
      memberRatio: config.default_member_ratio,
      ratioInput: config.default_member_ratio.toFixed(1),
      concierge: false,
      payment: false,
      tierOverride: null
    };

    function activeTierId() {
      return state.tierOverride || findBestTier(config.tiers, state.membership, state.concierge, state.payment, config);
    }

    function render() {
      var recommendedTier = findBestTier(config.tiers, state.membership, state.concierge, state.payment, config);
      var tierId = activeTierId();
      var tier = config.tiers.find(function (entry) { return entry.id === tierId; });
      var totalMembers = Math.round(state.membership * state.memberRatio);
      var adminRevenue = state.adminPepm * state.membership;
      var borRevenue = state.concierge ? 0 : config.bor_commission_pmpm * totalMembers;
      var grossRevenue = adminRevenue + borRevenue;
      var platformCost = tier.platform;
      var pepmCost = tier.pepm * state.membership;
      var conciergeCost = state.concierge ? config.concierge_pepm * state.membership : 0;
      var paymentCost = state.payment ? config.payment_processing_pepm * state.membership : 0;
      var totalCost = platformCost + pepmCost + conciergeCost + paymentCost;
      var monthlyProfit = grossRevenue - totalCost;
      var annualProfit = monthlyProfit * 12;
      var margin = grossRevenue > 0 ? (monthlyProfit / grossRevenue) * 100 : 0;
      var positive = monthlyProfit >= 0;

      membershipSlider.value = state.membership;
      membershipInput.value = state.membership;
      adminSlider.value = state.adminPepm;
      ratioSlider.value = Math.round(state.memberRatio * 10);
      ratioInput.value = state.ratioInput;
      conciergeInput.checked = state.concierge;
      paymentInput.checked = state.payment;

      document.getElementById("admin-value").textContent = "$" + state.adminPepm;
      document.getElementById("membership-helper").innerHTML = formatNumber(state.membership) + " EEs × " + state.memberRatio.toFixed(1) + " = <strong>" + formatNumber(totalMembers) + " members</strong><span style=\"color:#999\"> (incl. dependents)</span>";
      document.getElementById("bor-helper").innerHTML = state.concierge ? "" : "BOR commissions: " + formatNumber(totalMembers) + " members × $" + config.bor_commission_pmpm + " PMPM = <strong>" + formatCurrency(borRevenue, 0) + "/mo</strong>";

      tierButtons.forEach(function (button) {
        var buttonTierId = button.dataset.tierButton;
        var recommendedTag = button.querySelector(".tier-recommended");
        button.classList.toggle("active", buttonTierId === tierId);
        if (recommendedTag) {
          recommendedTag.hidden = buttonTierId !== recommendedTier;
        }
      });

      resetButton.hidden = !state.tierOverride;

      document.getElementById("concierge-chip").classList.toggle("active", state.concierge);
      document.getElementById("concierge-chip").textContent = state.concierge ? "✓" : "";
      document.getElementById("payment-chip").classList.toggle("active", state.payment);
      document.getElementById("payment-chip").textContent = state.payment ? "✓" : "";

      document.getElementById("concierge-impact").textContent = state.concierge ?
        "BOR commission revenue removed. Kyndly is now Broker of Record." :
        "Note: Selecting this removes your BOR commission revenue (" + formatCurrency(config.bor_commission_pmpm * totalMembers, 0) + "/mo).";

      document.getElementById("summary-head").classList.toggle("negative", !positive);
      document.getElementById("monthly-profit").innerHTML = formatCurrency(monthlyProfit, 0) + "<small>/mo</small>";
      document.getElementById("annual-profit").innerHTML = formatCurrency(annualProfit, 0) + "<small> /year</small>";
      document.getElementById("profit-margin").textContent = margin.toFixed(1) + "% margin";

      document.getElementById("admin-revenue-label").textContent = "ICHRA Admin (" + formatCurrency(state.adminPepm, 2) + " × " + formatNumber(state.membership) + " EEs)";
      document.getElementById("admin-revenue-value").textContent = formatCurrency(adminRevenue, 0);
      document.getElementById("bor-row").hidden = state.concierge;
      document.getElementById("bor-revenue-label").textContent = "BOR Commissions ($" + config.bor_commission_pmpm + " × " + formatNumber(totalMembers) + " members)";
      document.getElementById("bor-revenue-value").textContent = formatCurrency(borRevenue, 0);
      document.getElementById("bor-note").hidden = !state.concierge;
      document.getElementById("gross-revenue-value").textContent = formatCurrency(grossRevenue, 0);

      document.getElementById("platform-cost-label").textContent = "Kyndly Platform (" + tier.name + ")";
      document.getElementById("platform-cost-value").textContent = formatCurrency(-platformCost, 0);
      document.getElementById("pepm-cost-label").textContent = "Kyndly PEPM (" + formatCurrency(tier.pepm, 2) + " × " + formatNumber(state.membership) + " EEs)";
      document.getElementById("pepm-cost-value").textContent = formatCurrency(-pepmCost, 0);
      document.getElementById("concierge-row").hidden = !state.concierge;
      document.getElementById("concierge-cost-label").textContent = "Kyndly Concierge ($" + config.concierge_pepm + " × " + formatNumber(state.membership) + " EEs)";
      document.getElementById("concierge-cost-value").textContent = formatCurrency(-conciergeCost, 0);
      document.getElementById("payment-row").hidden = !state.payment;
      document.getElementById("payment-cost-label").textContent = "Kyndly Payment Processing ($" + config.payment_processing_pepm + " × " + formatNumber(state.membership) + " EEs)";
      document.getElementById("payment-cost-value").textContent = formatCurrency(-paymentCost, 0);
      document.getElementById("total-cost-value").textContent = formatCurrency(-totalCost, 0);
      document.getElementById("net-profit-value").textContent = formatCurrency(monthlyProfit, 0);
      document.getElementById("net-profit-value").classList.toggle("negative", !positive);
      document.getElementById("annual-net-profit-value").textContent = formatCurrency(annualProfit, 0);
      document.getElementById("annual-net-profit-value").classList.toggle("negative", !positive);
    }

    adminSlider.addEventListener("input", function () {
      state.adminPepm = Number(adminSlider.value);
      render();
    });

    membershipSlider.addEventListener("input", function () {
      state.membership = Math.max(50, Number(membershipSlider.value));
      render();
    });

    membershipInput.addEventListener("input", function () {
      state.membership = Math.max(50, Number(membershipInput.value || 0));
      render();
    });

    ratioSlider.addEventListener("input", function () {
      state.memberRatio = Number(ratioSlider.value) / 10;
      state.ratioInput = state.memberRatio.toFixed(1);
      render();
    });

    ratioInput.addEventListener("input", function () {
      state.ratioInput = ratioInput.value;
      var parsed = parseFloat(ratioInput.value);
      if (!Number.isNaN(parsed) && parsed >= 1.0 && parsed <= 3.0) {
        state.memberRatio = Math.round(parsed * 10) / 10;
      }
      render();
    });

    ratioInput.addEventListener("blur", function () {
      state.memberRatio = clamp(state.memberRatio, 1.0, 3.0);
      state.ratioInput = state.memberRatio.toFixed(1);
      render();
    });

    conciergeInput.addEventListener("change", function () {
      state.concierge = conciergeInput.checked;
      render();
    });

    paymentInput.addEventListener("change", function () {
      state.payment = paymentInput.checked;
      render();
    });

    tierButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var recommendedTier = findBestTier(config.tiers, state.membership, state.concierge, state.payment, config);
        state.tierOverride = button.dataset.tierButton === recommendedTier ? null : button.dataset.tierButton;
        render();
      });
    });

    resetButton.addEventListener("click", function () {
      state.tierOverride = null;
      render();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", initCalculator);
})();
