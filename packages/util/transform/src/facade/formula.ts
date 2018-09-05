// tslint:disable no-var-requires
import { Predicate, Transformer } from '../interfaces'
import { DatasetTransform } from './interfaces'

declare var require: any
const { formula: vegaFormula } = require('vega-transforms')

/**
 * The formula transform extends data objects with new values according to a calculation formula.
 */
export interface FormulaBuilder extends DatasetTransform {
	/**
	 * The formula to use for limiting results. If the expression evaluates to
	 * false, the data object will be formulaed.
	 *
	 * @param value
	 */
	formula(value: Predicate<any>): FormulaBuilder

	/**
	 * The output field at which to write the formula value.
	 * @param value
	 */
	as(value: string): FormulaBuilder

	/**
	 * If true, the formula is evaluated only when a data object is first observed.
	 * The formula values will not automatically update if data objects are modified.
	 * The default is false.
	 * @param value
	 */
	initOnly(value: boolean): FormulaBuilder
}

export class FormulaBuilderImpl implements FormulaBuilder {
	private formulaValue: Transformer<any, any> | undefined
	private asValue: string | undefined
	private initOnlyValue: boolean | undefined

	public formula(value: Predicate<any>) {
		this.formulaValue = value
		return this
	}

	public as(field: string) {
		this.asValue = field
		return this
	}

	public initOnly(value: boolean) {
		this.initOnlyValue = value
		return this
	}

	public build(df: any, from: any) {
		if (!this.formulaValue) {
			throw new Error('formula predicate must be defined')
		}
		if (!this.asValue) {
			throw new Error('formula as must be defined')
		}
		const spec: any = {
			expr: this.formulaValue,
			as: this.asValue,
			pulse: from,
		}
		if (this.initOnlyValue) {
			spec.initonly = this.initOnlyValue
		}
		const formulaNode = df.add(vegaFormula, spec)
		return formulaNode
	}
}

export function formula(predicate: Transformer<any, any>) {
	return new FormulaBuilderImpl().formula(predicate)
}