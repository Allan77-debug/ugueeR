import { render, fireEvent} from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import ButtonTouchable from '../ButtomTouchable';

describe('ButtonTouchable', () => {
  it('should render successfully', () => {
    const mockOnPress = jest.fn();
    const { root } = render(
      <ButtonTouchable onPress={mockOnPress}>
        <Text>Test Button</Text>
      </ButtonTouchable>
    );
    expect(root).toBeTruthy();
  });

  it('should render children correctly', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ButtonTouchable onPress={mockOnPress}>
        <Text>Test Button Content</Text>
      </ButtonTouchable>
    );
    expect(getByText('Test Button Content')).toBeTruthy();
  });

  it('should call onPress when touched', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <ButtonTouchable onPress={mockOnPress}>
        <Text>Clickable Button</Text>
      </ButtonTouchable>
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const mockOnPress = jest.fn();
    const customClass = 'custom-button-class';
    const { getByRole } = render(
      <ButtonTouchable onPress={mockOnPress} className={customClass}>
        <Text>Styled Button</Text>
      </ButtonTouchable>
    );
    
    const button = getByRole('button');
    expect(button.props.className).toBe(customClass);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <ButtonTouchable onPress={mockOnPress} disabled={true}>
        <Text>Disabled Button</Text>
      </ButtonTouchable>
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
    expect(button.props.disabled).toBe(true);
  });

  it('should not be disabled by default', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <ButtonTouchable onPress={mockOnPress}>
        <Text>Default Button</Text>
      </ButtonTouchable>
    );
    
    const button = getByRole('button');
    expect(button.props.disabled).toBeFalsy();
  });
});