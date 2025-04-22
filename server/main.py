from flask import Flask, request, jsonify
from models.lstm import LSTMModel
from models.gru import GRUModel
from models.nn import NNModel

app = Flask(__name__)

# Initialize models
lstm_model = LSTMModel()
gru_model = GRUModel()
nn_model = NNModel()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    model_type = data.get('model_type')
    input_data = data.get('input_data')

    if not model_type or not input_data:
        return jsonify({'error': 'model_type and input_data are required'}), 400

    try:
        if model_type == 'LSTM':
            prediction = lstm_model.predict(input_data)
        elif model_type == 'GRU':
            prediction = gru_model.predict(input_data)
        elif model_type == 'NN':
            prediction = nn_model.predict(input_data)
        else:
            return jsonify({'error': 'Invalid model_type'}), 400

        return jsonify({'prediction': prediction})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)