import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: React.ReactNode;
	variant?: 'fill' | 'outline' | 'text';
	color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'transparent';
	size?: 'sm' | 'md' | 'lg';
}

const Button = (props: ButtonProps) => {
	const { variant = 'fill', size = 'md', color = 'primary', className, ...others } = props;

	return (
		<button
			className={clsx('x-button', `--${variant}`, `--${size}`, `--${color}`, className)}
			{...others}
		/>
	);
};

export default Button;
