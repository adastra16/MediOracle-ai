/**
 * Medical Analysis Routes - Symptom analysis endpoints
 * Calls FastAPI backend for medical logic
 */

import express from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * @route POST /medical/symptoms
 * @desc Analyze symptoms and get severity score
 */
router.post('/symptoms', async (req, res) => {
  try {
    const { symptoms, age, gender, duration } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms array is required and must not be empty'
      });
    }

    // Call FastAPI backend
    const response = await axios.post(`${FASTAPI_URL}/api/analyze-symptoms`, {
      symptoms,
      age: age || null,
      gender: gender || null,
      duration: duration || null
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error('Symptoms analysis error', error.message);

    // Handle FastAPI unavailable
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Medical analysis service is currently unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.response?.data?.detail || error.message
    });
  }
});

/**
 * @route POST /medical/analyze
 * @desc General medical analysis with detailed breakdown
 */
router.post('/analyze', async (req, res) => {
  try {
    const { symptoms, medicalHistory, currentMedications } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms are required'
      });
    }

    // Call FastAPI backend
    const response = await axios.post(`${FASTAPI_URL}/api/analyze`, {
      symptoms,
      medical_history: medicalHistory || [],
      current_medications: currentMedications || []
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error('Medical analysis error', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Medical analysis service is currently unavailable.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.response?.data?.detail || error.message
    });
  }
});

export default router;
