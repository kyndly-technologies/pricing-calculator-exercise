from flask import Flask, render_template, request, jsonify
from calculator import calculate_pnl
from merge_config import merge_config
from pricing_defaults import SYSTEM_DEFAULTS

app = Flask(__name__)


@app.route("/")
def index():
    config = SYSTEM_DEFAULTS
    return render_template("calculator.html", config=config)


@app.route("/api/calculate", methods=["POST"])
def api_calculate():
    """API endpoint for the calculator. Accepts JSON inputs, returns P&L."""
    data = request.get_json()
    config = merge_config(data.get("client_config"))

    result = calculate_pnl(
        config=config,
        membership=int(data.get("membership", 500)),
        admin_pepm=float(data.get("admin_pepm", 50)),
        member_ratio=float(data.get("member_ratio", 1.5)),
        concierge=bool(data.get("concierge", False)),
        payment=bool(data.get("payment", False)),
        tier_override=data.get("tier_override"),
    )

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=3000)
