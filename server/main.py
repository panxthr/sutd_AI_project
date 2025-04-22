from flask import Flask, request, jsonify
from data.infer import get_prediction
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    required_fields = ['addr_lat', 'addr_long', 'flat_type', 'area_sqft', 'month', 'year']
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    try:
        addr_lat = float(data['addr_lat'])
        addr_long = float(data['addr_long'])
        flat_type = str(data['flat_type'])
        area_sqft = float(data['area_sqft'])
        month = int(data['month'])
        year = int(data['year'])

        prediction = get_prediction(addr_lat, addr_long, flat_type, area_sqft, month, year)

        return jsonify({'prediction': prediction})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
