import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import {
    calcItemAmount,
    calcTotalKg,
    calcTotalRs,
    gramsToKg,
    formatWeight,
    formatCurrency
} from '../../../utils/calculations';
import { numberToWordsTamil } from '../../../utils/tamilNumbers';
import { renderTamil } from '../../../utils/tamilRendering';
import { PdfIconPhone, PdfIconMail } from '../../common/PdfIcons';

// Fonts are registered in BillPDF.jsx

const CoolieTemplate = ({
    config,
    billNo,
    date,
    customerName,
    city,
    items,
    setharamGrams,
    courierRs,
    ahimsaSilkRs,
    customChargeName,
    customChargeRs
}) => {
    const { name, greeting, billType, address, phone, email, labels, colors } = config;

    // Theme Extraction (with fallbacks matching print.css variables)
    const theme = {
        primary: colors?.primary || '#388e3c',       // var(--bill-primary)
        primaryLight: colors?.headerBg || '#e8f5e9', // var(--bill-primary-light)
        textDark: colors?.textDark || '#2e7d32',     // var(--bill-text-dark)
        text: colors?.text || '#388e3c',             // var(--bill-text)
        rowAlt: colors?.rowAlt || '#f8faf8',         // var(--bill-row-alt)
        border: colors?.border || '#ddd'
    };

    const styles = StyleSheet.create({
        page: {
            fontFamily: 'MuktaMalar',
            paddingTop: 23, // 8mm
            paddingBottom: 23,
            paddingHorizontal: 34, // 12mm
            backgroundColor: '#fff',
            fontSize: 12,
            lineHeight: 1.5,
            color: theme.text,
            flexDirection: 'column',
        },
        /* ========== TOP GREETING ========== */
        topGreetingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 11,
        },
        greetingText: {
            fontSize: 10,
            fontWeight: 'bold',
            color: theme.primary,
            letterSpacing: 0.5,
        },
        /* ========== HEADER ========== */
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 11,
            marginBottom: 31,
        },
        companyInfo: {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
        companyName: {
            fontFamily: 'Arima',
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.primary,
            lineHeight: 1.2,
        },
        companySubtitle: {
            fontSize: 11,
            fontWeight: 600, // Medium boldness as requested
            color: '#333',
            marginTop: 6, // Spacing from English header
        },
        billTypeBadge: {
            fontSize: 12,
            fontWeight: 'bold',
            color: theme.primary,
            lineHeight: 1,
            fontFamily: 'MuktaMalar',
        },
        /* ========== BILL INFO ========== */
        billMetaRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.primaryLight,
            paddingVertical: 6,
            paddingHorizontal: 9,
            borderRadius: 6,
            marginBottom: 11,
        },
        billMetaText: {
            fontSize: 11,
            fontWeight: 'bold',
            color: theme.text,
        },
        billMetaValue: {
            fontWeight: 'bold',
            color: '#000',
        },
        /* ========== CUSTOMER INFO ========== */
        customerSection: {
            marginBottom: 15,
            paddingLeft: 4,
        },
        customerName: {
            fontSize: 12,
            fontWeight: 'normal',
            color: '#000',
            marginBottom: 10, // Increased space as requested
            flexDirection: 'row',
        },
        customerCity: {
            fontSize: 12,
            fontWeight: 'normal',
            color: '#000',
            flexDirection: 'row',
        },
        labelBold: {
            color: theme.primary,
            fontWeight: 'bold', // 700
            // No minWidth or large marginRight for "one spacing" look
        },
        customerValue: {
            fontWeight: 600, // Semi-Bold (Medium boldness)
            color: '#000',
        },
        /* ========== TABLE ========== */
        table: {
            width: '100%',
            marginTop: 15,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 6,
            overflow: 'hidden',
        },
        tableHeader: {
            flexDirection: 'row',
            backgroundColor: theme.primaryLight,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
            paddingVertical: 9,
            paddingHorizontal: 8,
            alignItems: 'center',
        },
        tableHeaderCell: {
            color: theme.textDark,
            fontSize: 11,
            fontWeight: 'bold',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        tableRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
            paddingVertical: 9,
            paddingHorizontal: 8,
            alignItems: 'center',
        },
        tableRowAlt: {
            backgroundColor: theme.rowAlt,
        },
        tableCell: {
            fontSize: 11,
            textAlign: 'center',
            color: '#333',
        },
        tableCellLeft: {
            fontSize: 11,
            textAlign: 'left',
            paddingLeft: 11,
            color: '#333',
            fontWeight: 'bold',
        },
        /* ========== TOTAL ========== */
        totalRow: {
            flexDirection: 'row',
            backgroundColor: theme.primaryLight,
            paddingVertical: 9,
            paddingHorizontal: 8,
            alignItems: 'center',
        },
        totalLabel: {
            fontSize: 11,
            fontWeight: 'bold',
            textAlign: 'right',
            paddingRight: 15,
            color: theme.textDark,
        },
        totalValue: {
            fontSize: 14,
            fontWeight: 'bold',
            textAlign: 'center',
            color: theme.textDark,
        },
        /* ========== WORDS ========== */
        wordsSection: {
            marginTop: 0,
            marginBottom: 23,
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        wordsLabel: {
            fontSize: 9,
            color: theme.text,
            fontWeight: 'bold',
            marginRight: 6,
        },
        wordsValue: {
            backgroundColor: theme.primaryLight,
            paddingVertical: 6,
            paddingHorizontal: 11,
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 'bold',
            color: theme.textDark,
        },
        /* ========== FOOTER ========== */
        footerContainer: {
            marginTop: 'auto',
            marginBottom: 30,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        },
        thankYou: {
            fontSize: 11,
            fontWeight: 'bold',
            color: theme.primary,
        },
        signatureCompany: {
            fontFamily: 'Arima',
            fontSize: 11,
            color: theme.primary,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        signatureLine: {
            fontSize: 9,
            color: '#555',
            fontWeight: 'bold',
            textAlign: 'center',
        },
        /* ========== CONTACT ========== */
        contactSection: {
            position: 'absolute',
            bottom: 23,
            left: 34,
            right: 34,
            backgroundColor: theme.primaryLight,
            padding: 11,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        contactTitle: {
            fontSize: 10,
            fontWeight: 'bold',
            color: theme.primary,
            marginBottom: 8,
        },
        contactText: {
            fontSize: 10,
            color: '#333',
            fontWeight: 'bold',
            marginBottom: 3,
        },
        contactPhone: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 3,
        }
    });

    const setharamKg = gramsToKg(setharamGrams);
    const totalKg = calcTotalKg(items, setharamGrams);
    const totalRs = calcTotalRs(items, courierRs, ahimsaSilkRs, customChargeRs);

    return (
        <Page size="A4" style={styles.page}>
            {/* Top Greeting Row */}
            <View style={styles.topGreetingRow}>
                <Text style={styles.greetingText}>{renderTamil('வாழ்க வையகம்')}</Text>
                <Text style={styles.greetingText}>{renderTamil('உ')}</Text>
                <Text style={styles.greetingText}>{renderTamil(greeting)}</Text>
            </View>

            {/* Header Content */}
            <View style={styles.headerRow}>
                <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{name.english}</Text>
                    <Text style={styles.companySubtitle}>{renderTamil(name.tamil)}</Text>
                </View>
                <Text style={styles.billTypeBadge}>{billType}</Text>
            </View>

            {/* Info Section */}
            <View style={styles.billMetaRow}>
                <Text style={styles.billMetaText}>{renderTamil(labels.billNo)} : <Text style={styles.billMetaValue}>{billNo}</Text></Text>
                <Text style={styles.billMetaText}>{renderTamil(labels.date)} : <Text style={styles.billMetaValue}>{date}</Text></Text>
            </View>

            {/* Customer */}
            <View style={styles.customerSection}>
                <Text style={styles.customerName}>
                    <Text style={styles.labelBold}>{renderTamil(labels.customerPrefix)}</Text>{' '}
                    <Text style={styles.customerValue}>{renderTamil(customerName)}</Text>
                </Text>
                <Text style={styles.customerCity}>
                    <Text style={styles.labelBold}>{renderTamil(labels.cityPrefix)}</Text>{' '}
                    <Text style={styles.customerValue}>{renderTamil(city)}</Text>
                </Text>
            </View>

            {/* Bill Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, { width: '15%' }]}>{renderTamil(labels.rate)}</Text>
                    <Text style={[styles.tableHeaderCell, { width: '45%', textAlign: 'left', paddingLeft: 11 }]}>{renderTamil(labels.itemName)}</Text>
                    <Text style={[styles.tableHeaderCell, { width: '15%' }]}>{renderTamil(labels.weight)}</Text>
                    <Text style={[styles.tableHeaderCell, { width: '25%' }]}>{renderTamil(labels.amount)}</Text>
                </View>

                {items.map((item, i) => (
                    <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                        <Text style={[styles.tableCell, { width: '15%' }]}>{renderTamil(item.coolie)}</Text>
                        <Text style={[styles.tableCellLeft, { width: '45%' }]}>{renderTamil(item.porul)}</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>{item.kg ? formatWeight(item.kg) : ''}</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>{item.kg ? formatCurrency(calcItemAmount(item.coolie, item.kg)) : ''}</Text>
                    </View>
                ))}

                {setharamGrams && (
                    <View style={[styles.tableRow, items.length % 2 === 1 ? styles.tableRowAlt : {}]}>
                        <Text style={[styles.tableCell, { width: '15%' }]}>-</Text>
                        <Text style={[styles.tableCellLeft, { width: '45%' }]}>{renderTamil(labels.setharam)}</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>{formatWeight(setharamKg)}</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>-</Text>
                    </View>
                )}

                {courierRs && (
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '15%' }]}>-</Text>
                        <Text style={[styles.tableCellLeft, { width: '45%' }]}>{renderTamil(labels.courier)}</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>-</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>{formatCurrency(courierRs)}</Text>
                    </View>
                )}

                {ahimsaSilkRs && (
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '15%' }]}>-</Text>
                        <Text style={[styles.tableCellLeft, { width: '45%' }]}>{renderTamil(labels.ahimsaSilk)}</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>-</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>{formatCurrency(ahimsaSilkRs)}</Text>
                    </View>
                )}

                {customChargeRs && (
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '15%' }]}>-</Text>
                        <Text style={[styles.tableCellLeft, { width: '45%' }]}>{renderTamil(customChargeName || labels.otherName || 'More')}</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>-</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>{formatCurrency(customChargeRs)}</Text>
                    </View>
                )}

                <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { width: '60%' }]}>{renderTamil(labels.total)}</Text>
                    <Text style={[styles.totalValue, { width: '15%' }]}>{formatWeight(totalKg)} Kg</Text>
                    <Text style={[styles.totalValue, { width: '25%' }]}>₹ {formatCurrency(totalRs)}</Text>
                </View>
            </View>

            {/* In Words Section */}
            <View style={styles.wordsSection}>
                <Text style={styles.wordsLabel}>{renderTamil(labels.inWords)}:</Text>
                <Text style={styles.wordsValue}>{renderTamil(numberToWordsTamil(totalRs))}</Text>
            </View>

            {/* Signatures */}
            <View style={styles.footerContainer}>
                <View>
                    <Text style={styles.thankYou}>{renderTamil('நன்றி')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.signatureCompany}>{name.english}</Text>
                    <View style={{ height: 50 }} />
                    <Text style={styles.signatureLine}>{renderTamil(labels.signature)}</Text>
                </View>
            </View>

            {/* Contact Information (Absolute Bottom) */}
            <View style={styles.contactSection}>
                <View>
                    <Text style={styles.contactTitle}>{renderTamil('தொடர்பு கொள்ள')}</Text>
                    <Text style={styles.contactText}>{renderTamil(address.line1)}, {renderTamil(address.line2)}</Text>
                    <Text style={styles.contactText}>{renderTamil(address.line3)}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <PdfIconMail size={12} color={theme.text} />
                        <Text style={[styles.contactText, { marginBottom: 0, marginLeft: 6 }]}>{email}</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    {phone.map((num, i) => (
                        <View key={i} style={styles.contactPhone}>
                            <PdfIconPhone size={12} color={theme.text} />
                            <Text style={[styles.contactText, { fontWeight: 'bold', marginBottom: 0, marginLeft: 6 }]}>{num}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </Page>
    );
};

export default CoolieTemplate;
