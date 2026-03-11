import cv2
import numpy as np
from insightface.app import FaceAnalysis

app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=-1, det_size=(640,640))

def extract_embedding(image_bytes):

    img_array = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img is None:
        return None

    faces = app.get(img)

    if len(faces) == 0:
        return None

    embedding = faces[0].embedding.tolist()

    return embedding